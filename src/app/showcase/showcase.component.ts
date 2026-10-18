import { Component } from '@angular/core';
import { ALERT_IMPORTS } from '../design-system/alert';

@Component({
  selector: 'app-showcase',
  imports: [ALERT_IMPORTS],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent {}
