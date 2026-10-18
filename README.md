# Alert and Card — design system case study

`ds-alert` and `ds-card` for an Angular design system: one implementation per component, two
brands (Luma and Nova) driven only by shared design tokens. The original brief is in
[CHALLENGE.md](CHALLENGE.md); every decision and correction is logged in [AI-LOG.md](AI-LOG.md).

## Run, test, build

```bash
nvm use                      # Node 24.15 (.nvmrc); the Angular CLI needs 22.22.3+ or 24.15+
npm install
npm start                    # showcase with examples and usage snippets; brand switcher top right
npm test -- --watch=false    # Vitest + TestBed (jsdom)
npm run build
```

## Usage

```ts
import { ALERT_IMPORTS } from './design-system/alert';
import { CARD_IMPORTS } from './design-system/card';
@Component({ imports: [ALERT_IMPORTS, CARD_IMPORTS], ... })
```

**Alert.** Inputs: `variant` (`info` · `success` · `warning` · `error`), `heading`, `showIcon`,
`dismissible`, `dismissLabel`, `live` (`off` · `polite` · `assertive`). Output: `dismissed`. The body
is projected; the action is `a[dsAlertAction]` or `button[dsAlertAction]`; `[dsAlertIcon]` replaces
the default icon. The alert is controlled: it emits `dismissed` and the parent removes it.

```html
<ds-alert variant="warning" heading="Payment method expiring" live="off">
  Your card ending in 4242 expires next month.
  <a dsAlertAction href="/billing">Update payment method</a>
</ds-alert>
```

**Card.** Optional slots in a fixed reading order: `img[dsCardImage]` (with a required `alt`),
`[dsCardHeader]`, the body (everything outside the named slots) and `[dsCardFooter]`.
`[dsCardTitle]` goes on your own heading, so you choose its level.

```html
<ds-card>
  <div dsCardHeader><h3 dsCardTitle>Payment methods</h3></div>
  Visa ending in 4242 · expires 11/26
  <div dsCardFooter><button type="button">Add payment method</button></div>
</ds-card>
```

## Key decisions and spec ambiguities

- Configuration through inputs, content through projection; the card's default slot is the body,
  so nothing is dropped.
- Tokens are explicit per role: shared foundations once in `:root`, brand-specific values in both
  brand blocks, component internals as private `--_*` properties.
- Responsive with container queries: the alert switches to its compact layout below 30rem of its
  own width, also inside a narrow card.
- **Icon color trade-off:** warning and error use the spec's outlined icon and differ visually only
  by color; the hidden variant prefix carries the meaning for assistive technology. To raise with
  design.
- **Action color contradiction:** the mock renders the action in the text color, but the brand
  treatment says violet/teal and the starter has `--ds-action`. Followed the explicit rule; flagged
  for design.
- **Spacing:** spec pixels (3, 7, 10 px and the action's line height) are rounded to the spacing
  and type scale.

Details and reasons for each, row by row, in [AI-LOG.md](AI-LOG.md).

## Accessibility and tests

- Live regions: `polite` → `role="status"`, `assertive` → `role="alert"`, `off` → no role, never
  an extra `aria-live`. Errors default to assertive; alerts present on load use `live="off"`.
- A visually hidden variant prefix ("Error:") is read first. It and the default dismiss label are
  translated in one place, `DS_ALERT_LABELS`. Icons are decorative (`aria-hidden`).
- Native elements: the dismiss button is a `button type="button"` named by `DS_ALERT_LABELS` or a
  per-alert `dismissLabel`, with a 24px hit area; button actions default to `type="button"` so they never submit a form. Focus is
  visible with `--ds-focus`.
- Card: required `alt` (the build fails without it, `alt=""` for decorative images), heading level
  chosen by the consumer, and `div` slots in the examples to avoid fake banner/contentinfo
  landmarks.

The 36 tests cover the public and accessibility contract: alert roles per variant and `live`,
accessible text and i18n labels, projection, icons, action types and dismiss; card slot order,
unused slots, nothing dropped, `alt` and heading level; and token parity between both brands.
jsdom has no layout, so the rest was verified outside the tests: layout and container queries in
headless Chrome in both brands, contrast computed with a script from the token values, and the
focus ring checked manually with the keyboard.

## Known limitations

- An alert inserted together with its live region (for example inside `@if`) may not be announced
  by some screen readers: they only announce changes inside a live region that already exists.
  Render dynamic alerts inside a live region present on load, or use `live="assertive"` for
  critical ones.

## Left out and next steps

- A core color palette, once a third brand or dark mode arrives.
- A `@layer` for the design system's styles, so apps can override them predictably.
- Routing or Storybook for the showcase as more components are added.
- Visual regression tests.
- A design-system Button component, with `--ds-action-hover` tokens per brand; the showcase uses
  demo buttons styled locally, with hover and active states derived via `color-mix()`.
- Design review of the Nova border color, and a distinct error icon shape.
- Tests that still assert on internal classes (`.icon`, `.heading`, `.body`, `.visually-hidden`).
- `tokens.spec.ts` resolves `tokens.scss` from `process.cwd()`, so it must run from the project
  root.
- The action sets its default `type` once; a dynamic `[attr.type]` binding from the consumer would
  compete with it.

## Working with AI

Built with Claude Code, guided by the rules in [CLAUDE.md](CLAUDE.md): small steps, a plan before
code, tokens only, accessibility in every component, and tests on behavior. I reviewed every diff
before committing, and new tests were checked by breaking the code on purpose. Each accepted,
rejected or corrected proposal is recorded in [AI-LOG.md](AI-LOG.md).

## Extra (post-timebox): multi-platform tokens

Done after the 4-hour timebox and optional. It lives on the branch `post-timebox/token-pipeline`
and doesn't change any component or the showcase.

Run `npm install`, then `npm run tokens`. The output goes to `tokens/build/web` (CSS custom
properties), `tokens/build/ios` (Swift) and `tokens/build/android` (Jetpack Compose).

The DTCG JSON files in `tokens/` are the source of truth: `foundations.json` holds the shared
values and each brand has its own file in `tokens/brands/`. `build-tokens.mjs` runs Style
Dictionary once per brand, and `token-pipeline.spec.ts` proves the generated CSS matches
`tokens.scss` selector by selector, name by name and value by value.

Why it matters: one source of truth for web, iOS and Android across brands. Next step:
`tokens.scss` becomes a generated file.

```mermaid
flowchart TD
  figma["Figma Variables<br/>(designer)"]:::target
  export["Export to DTCG JSON<br/>(Tokens Studio or Figma Variables API)"]:::target
  json["tokens/*.json in git<br/>reviewed via pull request"]:::built
  sd["Style Dictionary<br/>one build per brand"]:::built
  css["Web: CSS custom properties"]:::built
  swift["iOS: Swift"]:::built
  compose["Android: Compose"]:::built
  mcp["Design system MCP server<br/>(AI agents read tokens and component APIs)"]:::target
  angular["Angular components"]:::target
  native["Native apps"]:::target
  codeConnect["Figma Code Connect<br/>(Angular, Swift and Compose snippets in Dev Mode)"]:::target

  figma -.-> export -.-> json
  json --> sd
  sd --> css & swift & compose
  json -.-> mcp
  css -.-> angular
  swift -.-> native
  compose -.-> native
  angular -.-> codeConnect
  native -.-> codeConnect
  codeConnect -.-> figma

  classDef built stroke-width:2px
  classDef target stroke-dasharray:5 5
```

Solid: built on this branch. Dashed: target, not built. The pull request on `tokens/*.json` is where
design and engineering agree on every token change before it reaches any platform.

Target, not built:

- A DTCG resolver to combine brand × mode.
- Token CI and versioned releases with Changesets.

### Target system architecture (not built)

```mermaid
flowchart TD
  subgraph figmaLib["Figma"]
    figma["Figma library (Variables)"]
  end
  subgraph tokensRepo["Tokens repo"]
    dtcg["DTCG JSON + Style Dictionary<br/>CI + Changesets"]
    npm["npm package (CSS + TS)"]
    spm["Swift Package"]
    maven["Maven/Gradle artifact (Compose)"]
  end
  subgraph libs["Component libraries (one repo per platform)"]
    ng["Angular"]
    swiftui["SwiftUI"]
    composeLib["Compose"]
  end
  subgraph apps["Product apps"]
    web["Web"]
    ios["iOS"]
    android["Android"]
  end
  docs["Docs site"]
  mcp["Design system MCP server"]

  figma <-->|"Tokens Studio / Variables API"| dtcg
  dtcg --> npm & spm & maven
  npm --> ng
  spm --> swiftui
  maven --> composeLib
  ng -->|by version| web
  swiftui -->|by version| ios
  composeLib -->|by version| android
  tokensRepo --> docs & mcp
  libs --> docs & mcp
```

Multi-repo lets each platform release on its own cadence and keeps native tooling native; a
monorepo makes a token change and its component impact land in one pull request. I would start
with a tokens repo plus per-platform libraries, and revisit it once the team grows.
