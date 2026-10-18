import { Directive, input } from '@angular/core';

/**
 * The card's header image. alt is required: describe the image, or pass alt="" when it is decorative.
 * The aspect ratio is fixed so cards in a grid line up whatever the source image size.
 */
@Directive({
  selector: 'img[dsCardImage]',
  host: {
    '[attr.alt]': 'alt()',
    style: 'display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover',
  },
})
export class CardImageDirective {
  readonly alt = input.required<string>();
}
