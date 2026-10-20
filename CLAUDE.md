# Rules for this repo

## Setup

- Node 24.15 (.nvmrc): run `nvm use` before any npm/ng command.
- `npm start` · `npm test -- --watch=false` · `npm run build`

## Scope

- Design-system code lives in src/app/design-system/<name>/, selector prefix `ds-`.
  The rules below apply there; src/app/showcase is demo/docs only.
- Alert spec: spec/design-spec.html. Card has no spec: propose its API before coding.

## Angular

- Angular 22, zoneless. Standalone (don't add `standalone: true`), OnPush, signals,
  input()/output()/contentChild(), host metadata instead of @HostBinding,
  new control flow (@if, @for with track).

## Styling

- Styles in each component's .scss. SCSS only for authoring (nesting, mixins, partials).
  Never SCSS variables ($...) for themable values: brand switching is runtime.
- Only --ds-\* tokens or private --\_\* properties: no hardcoded colors, radii,
  spacing or font sizes. Components never know the active brand.
- tokens.scss has one complete block per brand (Luma also on :root), so each
  brand can change any token on its own, following the existing naming.
- Component-internal constants that don't vary by brand are private --\_\*
  custom properties at the top of the component's SCSS, not tokens.
- Tokens stay explicit per role: never point a token to another role just
  because they share a value today.
- Responsive with container queries, not media queries.

## Accessibility

- Native elements, accessible names, visible focus with --ds-focus,
  no color-only meaning. Exception: warning and error icons follow the spec and
  differ only by color; the variant is conveyed to assistive technology by the
  hidden prefix. Known trade-off, to raise with design. Warning and error text
  must state the severity in words.

## Workflow

- Small changes. Propose a plan before writing code.
- When a step is done, propose a commit with a conventional message
  (feat/fix/test/docs/chore, scope, short summary) and run it only after I
  approve. Never push, never amend or rewrite history, never change git config.
- AI-LOG.md records decisions, not activity. Add a row whenever:
  - I accept, reject or change one of your proposals,
  - you catch a problem I hadn't considered (say so in the row),
  - I correct something you produced.
    Columns: Step | My request | What the AI produced | What I changed and why.
    "Why" must be my reason, in my words. If I didn't give one, ask me one short
    question instead of inventing it. One line per cell. Skip trivial steps.
    Update the log in the same commit as the step it describes.

## Tests

- Vitest + TestBed (jsdom): behavior and accessibility (roles, names, ARIA,
  keyboard), not snapshots. jsdom has no layout: don't test container queries/contrast.
