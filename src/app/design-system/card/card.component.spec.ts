import { Component, signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ALERT_IMPORTS } from '../alert';
import { CARD_IMPORTS } from './index';

@Component({
  imports: [CARD_IMPORTS],
  template: `
    <ds-card>
      <div dsCardFooter><button type="button">Update plan</button></div>
      Your plan renews on 1 November.
      <div dsCardHeader><h2 dsCardTitle>Billing</h2></div>
      <img dsCardImage src="/team.jpg" alt="The support team at the office" />
    </ds-card>
  `,
})
class OutOfOrderHost {}

@Component({
  imports: [CARD_IMPORTS],
  template: `<ds-card>Only a body.</ds-card>`,
})
class BodyOnlyHost {}

@Component({
  imports: [CARD_IMPORTS],
  template: `
    <ds-card class="header-only"><div dsCardHeader><h3 dsCardTitle>Storage</h3></div></ds-card>
    <ds-card class="footer-only"><div dsCardFooter><button type="button">Upgrade</button></div></ds-card>
  `,
})
class SingleSlotHost {}

@Component({
  imports: [CARD_IMPORTS],
  template: `
    <ds-card>
      Loose text before.
      <div dsCardHeader><h3 dsCardTitle>Team</h3></div>
      <p class="loose-paragraph">A paragraph between slots.</p>
      <div dsCardFooter><button type="button">Invite</button></div>
      <span class="loose-span">A span after the footer.</span>
    </ds-card>
  `,
})
class MixedContentHost {}

@Component({
  imports: [CARD_IMPORTS],
  template: `
    <ds-card>
      <img dsCardImage src="/pattern.svg" alt="" class="decorative" />
      <img dsCardImage src="/office.jpg" [alt]="description()" class="bound" />
    </ds-card>
  `,
})
class ImageHost {
  readonly description = signal('Open-plan office');
}

@Component({
  imports: [CARD_IMPORTS, ALERT_IMPORTS],
  template: `
    <ds-card>
      <div dsCardHeader><h4 dsCardTitle>Payment</h4></div>
      <ds-alert variant="warning" heading="Payment method expiring">
        Your card ending in 4242 expires next month.
      </ds-alert>
    </ds-card>
  `,
})
class AlertInCardHost {}

function setup<T>(hostType: Type<T>) {
  const fixture = TestBed.createComponent(hostType);
  fixture.detectChanges();
  const card = fixture.nativeElement.querySelector('ds-card') as HTMLElement;
  return { fixture, host: fixture.componentInstance, card };
}

/** Slots the card renders, in DOM (and reading) order. */
function partsOf(card: HTMLElement): string[] {
  return [...card.children].map((child) => {
    if (child.matches('img[dsCardImage]')) return 'image';
    if (child.matches('[dsCardHeader]')) return 'header';
    if (child.matches('[dsCardFooter]')) return 'footer';
    return 'body';
  });
}

describe('CardComponent', () => {
  describe('structure', () => {
    it('renders image, header, body and footer in a fixed reading order', () => {
      const { card } = setup(OutOfOrderHost);

      expect(partsOf(card)).toEqual(['image', 'header', 'body', 'footer']);
    });

    it('leaves nothing in the DOM for unused named slots', () => {
      const { card } = setup(BodyOnlyHost);

      expect(card.querySelector('img, [dsCardHeader], [dsCardFooter]')).toBeNull();
      expect(partsOf(card)).toEqual(['body']);
    });

    it.each([
      ['header-only', '[dsCardHeader]', '[dsCardFooter]'],
      ['footer-only', '[dsCardFooter]', '[dsCardHeader]'],
    ])('renders a header or footer only when provided (%s)', (cardClass, rendered, absent) => {
      const { fixture } = setup(SingleSlotHost);
      const card = fixture.nativeElement.querySelector(`ds-card.${cardClass}`) as HTMLElement;

      expect(card.querySelector(rendered)).not.toBeNull();
      expect(card.querySelector(absent)).toBeNull();
    });

    it('projects everything outside the named slots as the body, dropping nothing', () => {
      const { card } = setup(MixedContentHost);
      const paragraph = card.querySelector('.loose-paragraph');
      const span = card.querySelector('.loose-span');

      expect(card.textContent).toContain('Loose text before.');
      expect(paragraph?.textContent).toBe('A paragraph between slots.');
      expect(span?.textContent).toBe('A span after the footer.');
      expect(paragraph?.closest('[dsCardHeader], [dsCardFooter]')).toBeNull();
      expect(span?.closest('[dsCardHeader], [dsCardFooter]')).toBeNull();
      expect(paragraph?.parentElement).toBe(span?.parentElement);
    });
  });

  describe('image', () => {
    it('renders its alt text', () => {
      const { card } = setup(OutOfOrderHost);

      expect(card.querySelector('img')?.getAttribute('alt')).toBe('The support team at the office');
    });

    it('keeps an empty alt for decorative images', () => {
      const { card } = setup(ImageHost);

      expect(card.querySelector('img.decorative')?.getAttribute('alt')).toBe('');
    });

    it('passes a bound alt through to the native attribute', () => {
      const { fixture, host, card } = setup(ImageHost);
      const image = card.querySelector('img.bound');
      expect(image?.getAttribute('alt')).toBe('Open-plan office');

      host.description.set('Meeting room');
      fixture.detectChanges();
      expect(image?.getAttribute('alt')).toBe('Meeting room');
    });
  });

  describe('title', () => {
    it.each<[Type<unknown>, string]>([
      [OutOfOrderHost, 'H2'],
      [AlertInCardHost, 'H4'],
    ])('keeps the heading level chosen by the consumer', (hostType, tagName) => {
      const { card } = setup(hostType);

      expect(card.querySelector('[dsCardTitle]')?.tagName).toBe(tagName);
    });
  });

  describe('composition', () => {
    it('keeps an alert in the body working, with its role and content', () => {
      const { card } = setup(AlertInCardHost);
      const alert = card.querySelector('ds-alert');

      expect(alert?.closest('[dsCardHeader], [dsCardFooter]')).toBeNull();
      expect(alert?.closest('ds-card')).not.toBeNull();
      expect(alert?.getAttribute('role')).toBe('status');
      expect(alert?.textContent).toContain('Your card ending in 4242 expires next month.');
    });
  });
});
