import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Title typography for the consumer's heading, so the consumer chooses the level: <h3 dsCardTitle>. */
@Component({
  selector: '[dsCardTitle]',
  template: '<ng-content />',
  styleUrl: './card-title.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTitleComponent {}
