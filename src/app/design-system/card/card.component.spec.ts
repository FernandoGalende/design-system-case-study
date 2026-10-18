import { Component, signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ALERT_IMPORTS } from '../alert';
import { CARD_IMPORTS } from './index';

@Component({
  imports: [CARD_IMPORTS],
  template: `
    <ds-card>
      <footer dsCardFooter><button type="button">Update plan</button></footer>
      Your plan renews on 1 November.
      <header dsCardHeader><h2 dsCardTitle>Billing</h2></header>
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
    <ds-card class="header-only"><header dsCardHeader><h3 dsCardTitle>Storage</h3></header></ds-card>
    <ds-card class="footer-only"><footer dsCardFooter><button type="button">Upgrade</button></footer></ds-card>
  `,
})
class SingleSlotHost {}

@Component({
  imports: [CARD_IMPORTS],
  template: `
    <ds-card>
      Loose text before.
      <header dsCardHeader><h3 dsCardTitle>Team</h3></header>
      <p class="loose-paragraph">A paragraph between slots.</p>
      <footer dsCardFooter><button type="button">Invite</button></footer>
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
      <header dsCardHeader><h4 dsCardTitle>Payment</h4></header>
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

/** Elements the card renders, in DOM (and reading) order. */
function partsOf(card: HTMLElement): string[] {
  return [...card.children].map((child) => child.tagName.toLowerCase());
}

describe('CardComponent', () => {
  describe('structure', () => {
    it('renders image, header, body and footer in a fixed reading order', () => {
      const { card } = setup(OutOfOrderHost);

      expect(partsOf(card)).toEqual(['img', 'header', 'div', 'footer']);
    });

    it('leaves nothing in the DOM for unused named slots', () => {
      const { card } = setup(BodyOnlyHost);

      expect(card.querySelector('img, header, footer')).toBeNull();
      expect(partsOf(card)).toEqual(['div']);
    });

    it.each([
      ['header-only', 'header', 'footer'],
      ['footer-only', 'footer', 'header'],
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
      expect(paragraph?.closest('header, footer')).toBeNull();
      expect(span?.closest('header, footer')).toBeNull();
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

      expect(alert?.closest('ds-card > div')).not.toBeNull();
      expect(alert?.getAttribute('role')).toBe('status');
      expect(alert?.textContent).toContain('Your card ending in 4242 expires next month.');
    });
  });
});
