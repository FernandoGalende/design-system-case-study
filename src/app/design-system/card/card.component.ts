import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A surface with an optional image, header and footer. Content outside the named slots is the body.
 * It has no role: semantics come from its content and context (e.g. a list item or an article).
 */
@Component({
  selector: 'ds-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {}
