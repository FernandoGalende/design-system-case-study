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
- A visually hidden variant prefix ("Error:") is read first and can be translated through
  `DS_ALERT_VARIANT_LABELS`. Icons are decorative (`aria-hidden`).
- Native elements: the dismiss button is a `button type="button"` named by `dismissLabel`, with a
  24px hit area; button actions default to `type="button"` so they never submit a form. Focus is
  visible with `--ds-focus`.
- Card: required `alt` (the build fails without it, `alt=""` for decorative images), heading level
  chosen by the consumer, and `div` slots in the examples to avoid fake banner/contentinfo
  landmarks.

The 35 tests cover the public and accessibility contract: alert roles per variant and `live`,
accessible text and i18n prefix, projection, icons, action types and dismiss; card slot order,
unused slots, nothing dropped, `alt` and heading level; and token parity between both brands.
Layout, container queries and contrast can't be tested in jsdom, so they were checked in headless
Chrome in both brands.

## Left out and next steps

- A core color palette, once a third brand or dark mode arrives.
- A `@layer` for the design system's styles, so apps can override them predictably.
- Routing or Storybook for the showcase as more components are added.
- Visual regression tests.
- Design review of the Nova border color, and a distinct error icon shape.

## Working with AI

Built with Claude Code, guided by the rules in [CLAUDE.md](CLAUDE.md): small steps, a plan before
code, tokens only, accessibility in every component, and tests on behavior. I reviewed every diff
before committing, and new tests were checked by breaking the code on purpose. Each accepted,
rejected or corrected proposal is recorded in [AI-LOG.md](AI-LOG.md).
