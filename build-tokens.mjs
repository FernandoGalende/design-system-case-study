// Builds the DTCG tokens in tokens/ into web CSS, iOS Swift and Android Compose, one build per brand.
// Run with `npm run tokens`; output goes to tokens/build/.
import StyleDictionary from 'style-dictionary';

const BRANDS = ['luma', 'nova'];
const BUILD = 'tokens/build/';
const FOUNDATIONS = 'tokens/foundations.json';
// Luma is the default brand, as in tokens.scss.
const SELECTORS = { luma: ":root, [data-brand='luma']", nova: "[data-brand='nova']" };
const IOS_WEIGHTS = {
  100: 'ultraLight', 200: 'thin', 300: 'light', 400: 'regular', 500: 'medium',
  600: 'semibold', 700: 'bold', 800: 'heavy', 900: 'black',
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

const foundations = new StyleDictionary({
  source: [FOUNDATIONS],
  platforms: {
    web: {
      transformGroup: 'css',
      buildPath: `${BUILD}web/`,
      files: [{ destination: 'foundations.css', format: 'css/variables', options: { selector: ':root' } }],
    },
  },
});
await foundations.buildAllPlatforms();

for (const brand of BRANDS) {
  const className = `${pascal(brand)}Tokens`;
  const brandTokens = new StyleDictionary({
    source: [FOUNDATIONS, `tokens/brands/${brand}.json`],
    hooks,
    platforms: {
      // Web keeps foundations in :root (foundations.css) and only the brand's own values here.
      web: {
        transformGroup: 'css',
        buildPath: `${BUILD}web/`,
        files: [{
          destination: `${brand}.css`,
          format: 'css/variables',
          filter: (token) => token.filePath.includes('/brands/'),
          options: { selector: SELECTORS[brand] },
        }],
      },
      // Native files are complete per brand: foundations plus brand values in one object.
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
  await brandTokens.buildAllPlatforms();
}
