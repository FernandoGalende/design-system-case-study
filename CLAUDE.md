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
- Only --ds-\* tokens: no hardcoded colors, radii, spacing or font sizes. If a token
  is missing (e.g. typography, border), add it to BOTH brands in tokens.scss,
  following the existing naming. Components never know the active brand.
- Responsive with container queries, not media queries.

## Accessibility

- Native elements, accessible names, visible focus with --ds-focus,
  no color-only meaning.

## Workflow

- Small changes. Propose a plan before writing code.
- When a step is done, propose a commit with a conventional message
  (feat/fix/test/docs/chore, scope, short summary) and run it only after I
  approve. Never push, never amend or rewrite history, never change git config.
- Keep AI-LOG.md up to date. After each task I give you, add one row to the
  table: the step, a one-line summary of my request, and a one-line summary of
  what you produced. Fill "What I changed and why" only with my words, briefly:
  what I changed, or what I verified if I accepted it unchanged. Never invent
  reasons. Never edit older rows unless I ask. Don't log trivial requests.
  Show me the diff before committing.

## Tests

- Vitest + TestBed (jsdom): behavior and accessibility (roles, names, ARIA,
  keyboard), not snapshots. jsdom has no layout: don't test container queries/contrast.
