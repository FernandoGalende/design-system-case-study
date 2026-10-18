// The Luma block also matches :root, so a token missing from Nova silently falls back to its Luma
// value, and a Nova-only token is undefined in Luma. Both brands must define the same tokens.

// Specs are type-checked without Node types, so node:fs is loaded at runtime instead of imported.
async function readTokens(): Promise<string> {
  const fsModule = 'node:fs';
  const { readFileSync } = await import(/* @vite-ignore */ fsModule);
  const process = (globalThis as unknown as { process: { cwd(): string } }).process;
  return readFileSync(`${process.cwd()}/src/app/design-system/tokens/tokens.scss`, 'utf8');
}

function tokensIn(scss: string, selector: string): string[] {
  const start = scss.indexOf(selector);
  expect(start, `${selector} block`).toBeGreaterThan(-1);
  const block = scss.slice(scss.indexOf('{', start) + 1, scss.indexOf('}', start));
  return [...block.matchAll(/(--ds-[\w-]+)\s*:/g)].map((match) => match[1]);
}

describe('brand tokens', () => {
  let luma: string[];
  let nova: string[];

  beforeAll(async () => {
    const scss = await readTokens();
    luma = tokensIn(scss, "[data-brand='luma']");
    nova = tokensIn(scss, "[data-brand='nova']");
  });

  it('defines every Luma token in Nova', () => {
    expect(luma.length).toBeGreaterThan(0);
    expect(luma.filter((token) => !nova.includes(token))).toEqual([]);
  });

  it('defines no Nova-only token', () => {
    expect(nova.filter((token) => !luma.includes(token))).toEqual([]);
  });
});
