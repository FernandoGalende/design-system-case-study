// Builds the DTCG tokens in tokens/ into web CSS, iOS Swift and Android Compose, one build per brand.
// Run with `npm run tokens`; output goes to tokens/build/.
import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

const BRANDS = ['luma', 'nova'];
const BUILD = 'tokens/build/';
// Luma is the default brand, as in tokens.scss.
const SELECTORS = { luma: ":root, [data-brand='luma']", nova: "[data-brand='nova']" };
const IOS_WEIGHTS = {
  100: 'ultraLight', 200: 'thin', 300: 'light', 400: 'regular', 500: 'medium',
  600: 'semibold', 700: 'bold', 800: 'heavy', 900: 'black',
};

// Figma variables have no units: numbers arrive in px and get their DTCG type from the group they're in.
const FIGMA_NUMBERS = {
  'font-size': 'rem', 'line-height': 'rem', space: 'rem', radius: 'rem',
  border: 'px', 'focus-ring': 'px', 'font-weight': 'fontWeight',
};

const pascal = (brand) => brand[0].toUpperCase() + brand.slice(1);
const isDimension = (token) => token.$type === 'dimension';
const isFontWeight = (token) => token.$type === 'fontWeight';
const isTypeSize = (token) => ['font-size', 'line-height'].includes(token.path[1]);

/** rem and px to native points (1rem = 16), keeping the unit in mind; "16", not "16.00". */
function toPoints(value) {
  const match = /^(-?[\d.]+)(rem|px)$/.exec(value);
  if (!match) throw new Error(`Unsupported dimension: ${value}`);
  const points = Number(match[1]) * (match[2] === 'rem' ? 16 : 1);
  return String(Number(points.toFixed(2)));
}

/** Figma number to a DTCG dimension or fontWeight; fails on a group it doesn't know instead of guessing. */
function fromFigmaNumber(token, path) {
  const unit = FIGMA_NUMBERS[path[1]];
  if (!unit) throw new Error(`No unit for Figma number ${path.join('.')}`);
  if (unit === 'fontWeight') return { ...token, $type: 'fontWeight' };
  const value = unit === 'rem' ? `${token.$value / 16}rem` : `${token.$value}px`;
  return { ...token, $type: 'dimension', $value: value };
}

/** Plain DTCG tokens: drops Figma's $extensions and converts its unitless numbers. */
function normalize(group, path = []) {
  if ('$value' in group) {
    const { $extensions, ...token } = group;
    return token.$type === 'number' ? fromFigmaNumber(token, path) : token;
  }
  return Object.fromEntries(
    Object.entries(group).map(([key, child]) => [
      key,
      key.startsWith('$') ? child : normalize(child, [...path, key]),
    ]),
  );
}

/** A brand file, either plain DTCG or a Tokens Studio export with its tokens inside token sets. */
function brandTokens(brand) {
  const file = JSON.parse(readFileSync(`tokens/brands/${brand}.json`, 'utf8'));
  const sets = Object.entries(file).filter(([key]) => !key.startsWith('$')).map(([, set]) => set);
  const tokens = file.ds ? file : Object.assign({}, ...sets);
  return normalize(tokens);
}

const hooks = {
  transforms: {
    // The built-in rem transforms multiply px by 16 too (1px would become 16dp); this one reads the unit.
    'size/ds/compose': {
      type: 'value',
      filter: isDimension,
      transform: (token) => `${toPoints(token.$value)}.${isTypeSize(token) ? 'sp' : 'dp'}`,
    },
    // Same unit handling for iOS, as CGFloat points.
    'size/ds/swift': {
      type: 'value',
      filter: isDimension,
      transform: (token) => `CGFloat(${toPoints(token.$value)})`,
    },
    // Weights become Compose FontWeight values instead of bare numbers.
    'fontWeight/ds/compose': {
      type: 'value',
      filter: isFontWeight,
      transform: (token) => `FontWeight(${token.$value})`,
    },
    // Weights become UIFont.Weight cases instead of bare numbers.
    'fontWeight/ds/swift': {
      type: 'value',
      filter: isFontWeight,
      transform: (token) => `UIFont.Weight.${IOS_WEIGHTS[token.$value]}`,
    },
  },
};

const compose = ['attribute/cti', 'name/camel', 'color/composeColor', 'size/ds/compose', 'fontWeight/ds/compose'];
const swift = ['attribute/cti', 'name/camel', 'color/UIColorSwift', 'size/ds/swift', 'fontWeight/ds/swift'];

for (const brand of BRANDS) {
  const className = `${pascal(brand)}Tokens`;
  const dictionary = new StyleDictionary({
    tokens: brandTokens(brand),
    hooks,
    platforms: {
      // Every brand file is complete, so each platform gets all of the brand's tokens.
      web: {
        transformGroup: 'css',
        buildPath: `${BUILD}web/`,
        files: [{
          destination: `${brand}.css`,
          format: 'css/variables',
          options: { selector: SELECTORS[brand] },
        }],
      },
      ios: {
        transforms: swift,
        buildPath: `${BUILD}ios/`,
        files: [{ destination: `${className}.swift`, format: 'ios-swift/class.swift', options: { className } }],
      },
      android: {
        transforms: compose,
        buildPath: `${BUILD}android/`,
        files: [{
          destination: `${className}.kt`,
          format: 'compose/object',
          options: {
            className,
            packageName: 'designsystem.tokens',
            import: [
              'androidx.compose.ui.graphics.Color',
              'androidx.compose.ui.text.font.FontWeight',
              'androidx.compose.ui.unit.*',
            ],
          },
        }],
      },
    },
  });
  await dictionary.buildAllPlatforms();
}
