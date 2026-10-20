// The Luma file also matches :root, so a token missing from Nova silently falls back to its Luma
// value, and a Nova-only token is undefined in Luma. Both brands must define the same tokens.
// The CSS is built from tokens/brands/*.json (npm run tokens), which the app loads.

// Specs are type-checked without Node types, so node:fs is loaded at runtime instead of imported.
async function readTokens(brand: string): Promise<string> {
  const fsModule = 'node:fs';
  const { readFileSync } = await import(/* @vite-ignore */ fsModule);
  const process = (globalThis as unknown as { process: { cwd(): string } }).process;
  return readFileSync(`${process.cwd()}/tokens/build/web/${brand}.css`, 'utf8');
}

function tokensIn(css: string): string[] {
  return [...css.matchAll(/(--ds-[\w-]+)\s*:/g)].map((match) => match[1]);
}

describe('brand tokens', () => {
  let luma: string[];
  let nova: string[];

  beforeAll(async () => {
    luma = tokensIn(await readTokens('luma'));
    nova = tokensIn(await readTokens('nova'));
  });

  it('defines every Luma token in Nova', () => {
    expect(luma.length).toBeGreaterThan(0);
    expect(luma.filter((token) => !nova.includes(token))).toEqual([]);
  });

  it('defines no Nova-only token', () => {
    expect(nova.filter((token) => !luma.includes(token))).toEqual([]);
  });
});
