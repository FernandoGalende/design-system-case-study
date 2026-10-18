import { Directive } from '@angular/core';

/** Marks a custom icon that replaces the variant's default one. It is decorative and fills the icon slot. */
@Directive({
  selector: '[dsAlertIcon]',
  host: { 'aria-hidden': 'true', style: 'display: block; width: 100%; height: 100%' },
})
export class AlertIconDirective {}
