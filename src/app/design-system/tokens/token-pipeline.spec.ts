// The DTCG JSON in tokens/ and tokens.scss must stay one source of truth: the CSS built from the
// JSON (npm run tokens) has to match tokens.scss block by block, selector, names and values.

// Specs are type-checked without Node types, so node:fs is loaded at runtime instead of imported.
async function readProjectFile(path: string): Promise<string> {
  const fsModule = 'node:fs';
  const { readFileSync } = await import(/* @vite-ignore */ fsModule);
  const process = (globalThis as unknown as { process: { cwd(): string } }).process;
  return readFileSync(`${process.cwd()}/${path}`, 'utf8');
}

interface Block {
  selector: string;
  tokens: Record<string, string>;
}

/** The rule whose selector contains `marker`: its normalized selector and its --ds-* declarations. */
function blockOf(css: string, marker: string): Block {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  const rule = [...withoutComments.matchAll(/([^{}]+)\{([^}]*)\}/g)].find(([, selector]) =>
    selector.includes(marker),
  );
  expect(rule, `rule with ${marker}`).toBeDefined();
  const [, selector, body] = rule!;
  const tokens = Object.fromEntries(
    [...body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
  return { selector: selector.replace(/\s+/g, ' ').trim(), tokens };
}

describe('token pipeline', () => {
  let scss: string;

  beforeAll(async () => {
    scss = await readProjectFile('src/app/design-system/tokens/tokens.scss');
  });

  it.each([
    ['luma', "[data-brand='luma']"],
    ['nova', "[data-brand='nova']"],
  ])('builds %s.css with the same selector, names and values as tokens.scss', async (file, marker) => {
    const generated = blockOf(await readProjectFile(`tokens/build/web/${file}.css`), marker);
    const source = blockOf(scss, marker);

    expect(Object.keys(generated.tokens).length).toBeGreaterThan(0);
    expect(generated.selector).toBe(source.selector);
    expect(generated.tokens).toEqual(source.tokens);
  });
});
