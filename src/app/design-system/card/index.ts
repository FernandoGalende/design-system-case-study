import { CardFooterComponent } from './card-footer.component';
import { CardHeaderComponent } from './card-header.component';
import { CardImageDirective } from './card-image.directive';
import { CardTitleComponent } from './card-title.component';
import { CardComponent } from './card.component';

export { CardFooterComponent } from './card-footer.component';
export { CardHeaderComponent } from './card-header.component';
export { CardImageDirective } from './card-image.directive';
export { CardTitleComponent } from './card-title.component';
export { CardComponent } from './card.component';

export const CARD_IMPORTS = [
  CardComponent,
  CardImageDirective,
  CardHeaderComponent,
  CardTitleComponent,
  CardFooterComponent,
] as const;
