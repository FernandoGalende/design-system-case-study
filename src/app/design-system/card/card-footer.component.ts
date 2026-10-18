import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The card's footer slot, usually for actions. Use it on the element you want, e.g. <div dsCardFooter>. */
@Component({
  selector: '[dsCardFooter]',
  template: '<ng-content />',
  styleUrl: './card-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFooterComponent {}
