import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxJourneyHero, NgxJourneyHeroTag } from '@tmdjr/ngx-shared-headers';

@Component({
  selector: 'ngx-workshop-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxJourneyHero],
  template: `
    <ngx-journey-hero
      kicker="YOUR LEARNING PATH"
      title="Your workshops."
      subtitle="One step further."
      description="Read a lesson, check your understanding, and practice."
      descriptionContinuation="Keep learning, one workshop at a time."
      [tags]="tags"
      artIcon="auto_stories"
      artLabel="YOUR NEXT CHAPTER"
    />
  `,
  styles: `
    :host {
      display: block;
      --ngx-hero-ink: var(--ink);
      --ngx-hero-soft: var(--soft);
      --ngx-hero-panel: var(--panel);
      --ngx-hero-line: var(--line);
      --ngx-hero-muted: var(--muted);
      --ngx-hero-accent: var(--accent);
      --ngx-hero-primary-soft: var(--primary-soft);
      --ngx-hero-on-primary-soft: var(--on-primary-soft);
    }
  `,
})
export class WorkshopHeroComponent {
  readonly tags: readonly NgxJourneyHeroTag[] = [
    { icon: 'schedule', label: 'At your own pace' },
    { icon: 'insights', label: 'Progress that stays' },
  ];
}
