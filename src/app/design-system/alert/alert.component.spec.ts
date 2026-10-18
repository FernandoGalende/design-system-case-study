import { Component, signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ALERT_IMPORTS, AlertLive, AlertVariant, DS_ALERT_VARIANT_LABELS } from './index';

@Component({
  imports: [ALERT_IMPORTS],
  template: `
    <ds-alert
      [variant]="variant()"
      [live]="live()"
      [heading]="heading()"
      [showIcon]="showIcon()"
      [dismissible]="dismissible()"
      dismissLabel="Close alert"
      (dismissed)="dismissedCount = dismissedCount + 1"
    >
      Check your connection and try again.
    </ds-alert>
  `,
})
class ConfigurableHost {
  readonly variant = signal<AlertVariant>('info');
  readonly live = signal<AlertLive | undefined>(undefined);
  readonly heading = signal<string | undefined>(undefined);
  readonly showIcon = signal(true);
  readonly dismissible = signal(false);
  dismissedCount = 0;
}

@Component({
  imports: [ALERT_IMPORTS],
  template: `<ds-alert dismissible>Saved.</ds-alert>`,
})
class BareDismissibleHost {}

@Component({
  imports: [ALERT_IMPORTS],
  template: `
    <ds-alert variant="error">
      <svg dsAlertIcon class="custom-icon"></svg>
      We couldn't save your changes.
      <a dsAlertAction href="/retry">Try again</a>
    </ds-alert>
  `,
})
class ProjectedContentHost {}

@Component({
  imports: [ALERT_IMPORTS],
  template: `
    <form (submit)="$event.preventDefault(); submitCount = submitCount + 1">
      <ds-alert variant="error">
        Couldn't save.
        <button dsAlertAction class="default-type">Try again</button>
      </ds-alert>
      <ds-alert>
        Ready to send.
        <button dsAlertAction type="submit" class="submit-type">Send</button>
      </ds-alert>
    </form>
  `,
})
class ActionTypeHost {
  submitCount = 0;
}

/** Text a screen reader would get: everything except aria-hidden subtrees, whitespace collapsed. */
function textOf(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function setup<T>(hostType: Type<T>) {
  const fixture = TestBed.createComponent(hostType);
  fixture.detectChanges();
  const alert = fixture.nativeElement.querySelector('ds-alert') as HTMLElement;
  const update = (change: (host: T) => void) => {
    change(fixture.componentInstance);
    fixture.detectChanges();
  };
  return { fixture, host: fixture.componentInstance, alert, update };
}

describe('AlertComponent', () => {
  describe('live region', () => {
    it.each<[AlertVariant, string]>([
      ['info', 'status'],
      ['success', 'status'],
      ['warning', 'status'],
      ['error', 'alert'],
    ])('defaults the %s variant to role=%s', (variant, role) => {
      const { alert, update } = setup(ConfigurableHost);
      update((host) => host.variant.set(variant));

      expect(alert.getAttribute('role')).toBe(role);
    });

    it.each<[AlertLive, string | null]>([
      ['polite', 'status'],
      ['assertive', 'alert'],
      ['off', null],
    ])('maps live=%s to role=%s, overriding the variant default', (live, role) => {
      const { alert, update } = setup(ConfigurableHost);
      update((host) => {
        host.variant.set('error');
        host.live.set(live);
      });

      expect(alert.getAttribute('role')).toBe(role);
    });

    it('never adds aria-live on top of the role', () => {
      const { alert, update } = setup(ConfigurableHost);
      const variants: AlertVariant[] = ['info', 'success', 'warning', 'error'];
      const lives: (AlertLive | undefined)[] = [undefined, 'polite', 'assertive', 'off'];

      for (const variant of variants) {
        for (const live of lives) {
          update((host) => {
            host.variant.set(variant);
            host.live.set(live);
          });
          expect(alert.hasAttribute('aria-live')).toBe(false);
        }
      }
    });
  });

  describe('variant prefix', () => {
    it('reads the variant name before the content', () => {
      const { alert, update } = setup(ConfigurableHost);
      update((host) => host.variant.set('warning'));

      expect(textOf(alert)).toBe('Warning: Check your connection and try again.');
    });

    it('uses the labels provided for i18n', () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: DS_ALERT_VARIANT_LABELS,
            useValue: { info: 'Info :', success: 'Succès :', warning: 'Attention :', error: 'Erreur :' },
          },
        ],
      });
      const { alert, update } = setup(ConfigurableHost);
      update((host) => host.variant.set('error'));

      expect(alert.querySelector('.visually-hidden')?.textContent?.trim()).toBe('Erreur :');
    });
  });

  describe('content', () => {
    it('renders the heading only when it is set', () => {
      const { alert, update } = setup(ConfigurableHost);
      expect(alert.querySelector('.heading')).toBeNull();

      update((host) => host.heading.set("We couldn't save your changes"));
      expect(alert.querySelector('.heading')?.textContent?.trim()).toBe(
        "We couldn't save your changes",
      );
    });

    it('projects the body', () => {
      const { alert } = setup(ConfigurableHost);

      expect(alert.querySelector('.body')?.textContent?.trim()).toBe(
        'Check your connection and try again.',
      );
    });

    it('renders the projected action as a link with its href', () => {
      const { alert } = setup(ProjectedContentHost);
      const links = alert.querySelectorAll('a');

      expect(links).toHaveLength(1);
      expect(links[0].textContent?.trim()).toBe('Try again');
      expect(links[0].getAttribute('href')).toBe('/retry');
    });
  });

  describe('icon', () => {
    it('shows a decorative default icon', () => {
      const { alert } = setup(ConfigurableHost);
      const icon = alert.querySelector('.icon');

      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(icon?.querySelector('.default-icon')).not.toBeNull();
    });

    it('hides the icon when showIcon is false', () => {
      const { alert, update } = setup(ConfigurableHost);
      update((host) => host.showIcon.set(false));

      expect(alert.querySelector('.icon')).toBeNull();
    });

    it('replaces the default icon with a custom one', () => {
      const { alert } = setup(ProjectedContentHost);

      const icons = alert.querySelectorAll('svg');

      expect(icons).toHaveLength(1);
      expect(icons[0].classList).toContain('custom-icon');
      expect(icons[0].closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  describe('action type', () => {
    it('defaults a button action to type=button so it does not submit a form', () => {
      const { fixture, host } = setup(ActionTypeHost);
      const button = fixture.nativeElement.querySelector('.default-type') as HTMLButtonElement;

      expect(button.getAttribute('type')).toBe('button');
      button.click();
      expect(host.submitCount).toBe(0);
    });

    it('keeps a type set by the consumer', () => {
      const { fixture, host } = setup(ActionTypeHost);
      const button = fixture.nativeElement.querySelector('.submit-type') as HTMLButtonElement;

      expect(button.getAttribute('type')).toBe('submit');
      button.click();
      expect(host.submitCount).toBe(1);
    });
  });

  describe('dismiss', () => {
    it('renders no dismiss button by default', () => {
      const { alert } = setup(ConfigurableHost);

      expect(alert.querySelector('button')).toBeNull();
    });

    it('renders a native button named by dismissLabel', () => {
      const { alert, update } = setup(ConfigurableHost);
      update((host) => host.dismissible.set(true));
      const button = alert.querySelector('button');

      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-label')).toBe('Close alert');
    });

    it('emits dismissed on click and leaves removal to the parent', () => {
      const { alert, host, update } = setup(ConfigurableHost);
      update((h) => h.dismissible.set(true));

      alert.querySelector('button')?.click();

      expect(host.dismissedCount).toBe(1);
      expect(alert.isConnected).toBe(true);
    });

    it('accepts dismissible as a bare attribute with the default label', () => {
      const { alert } = setup(BareDismissibleHost);

      expect(alert.querySelector('button')?.getAttribute('aria-label')).toBe('Dismiss');
    });
  });
});
