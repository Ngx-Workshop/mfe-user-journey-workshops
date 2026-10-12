import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-workshop-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <header
      class="workshop-hero__hero"
      [class.workshop-hero__hero--paused]="motionPaused()"
    >
      <div class="workshop-hero__embers" aria-hidden="true">
        @for (particle of particles; track $index) {
          <span
            class="workshop-hero__particle"
            [style.left.%]="particle.left"
            [style.width.px]="particle.size"
            [style.--ember-size]="particle.size + 'px'"
            [style.animation-duration.s]="particle.duration"
            [style.animation-delay.s]="particle.delay"
          ></span>
        }
      </div>
      <div class="workshop-hero__hero-copy">
        <div class="workshop-hero__hero-kicker">
          <span></span>YOUR LEARNING PATH
        </div>
        <h1>Your workshops.<br /><em>One step further.</em></h1>
        <p>
          Read a lesson, check your understanding, and practice.<br
            class="workshop-hero__desktop-break"
          />
          Keep learning, one workshop at a time.
        </p>
        <div class="workshop-hero__hero-tags">
          <span><mat-icon>schedule</mat-icon>At your own pace</span
          ><span
            ><mat-icon>insights</mat-icon>Progress that stays</span
          >
        </div>
      </div>
      <div class="workshop-hero__hero-art" aria-hidden="true">
        <div class="workshop-hero__orb workshop-hero__orb--one"></div>
        <div class="workshop-hero__orb workshop-hero__orb--two"></div>
        <span class="workshop-hero__spark workshop-hero__spark--one"
          >✦</span
        ><span class="workshop-hero__spark workshop-hero__spark--two"
          >✧</span
        >
        <div class="workshop-hero__art-card">
          <div class="workshop-hero__art-icon">
            <mat-icon>auto_stories</mat-icon>
          </div>
          <span>YOUR NEXT CHAPTER</span>
          <div class="workshop-hero__art-bars">
            <i></i><i></i><i></i><i></i><i></i>
          </div>
          <div class="workshop-hero__art-line"></div>
          <div
            class="workshop-hero__art-line workshop-hero__art-line--short"
          ></div>
        </div>
        <div class="workshop-hero__art-check">
          <mat-icon>check</mat-icon>
        </div>
      </div>
      <button
        class="workshop-hero__motion-toggle"
        type="button"
        aria-label="Pause hero animation"
        [attr.aria-pressed]="motionPaused()"
        [title]="motionPaused() ? 'Resume hero animation' : 'Pause hero animation'"
        (click)="motionPaused.set(!motionPaused())"
      >
        <mat-icon>{{ motionPaused() ? 'play_arrow' : 'pause' }}</mat-icon>
      </button>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .workshop-hero__hero {
        position: relative;
        isolation: isolate;
        padding: 45px clamp(22px, 5vw, 65px);
        display: grid;
        grid-template-columns: minmax(0, 1fr) 260px;
        gap: 35px;
        overflow: hidden;
        background: var(--soft);
        border-bottom: 1px solid var(--line);
      }
      .workshop-hero__embers {
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background:
          radial-gradient(ellipse at 75% 120%,
            color-mix(in srgb, var(--mat-sys-primary) 18%, transparent),
            transparent 65%),
          radial-gradient(ellipse at 20% 130%,
            color-mix(in srgb, var(--mat-sys-tertiary) 12%, transparent),
            transparent 55%);
      }
      .workshop-hero__particle {
        position: absolute;
        bottom: -12px;
        height: 100%;
        color: var(--mat-sys-primary);
        --ember-drift: clamp(48px, 9vw, 140px);
        animation: workshop-hero-ember-rise linear infinite;
      }
      .workshop-hero__particle::before {
        content: '';
        position: absolute;
        bottom: 0;
        width: 100%;
        height: var(--ember-size);
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px 1px currentColor,
          0 0 15px 3px color-mix(in srgb, currentColor 35%, transparent);
      }
      .workshop-hero__particle:nth-child(3n) {
        color: var(--mat-sys-tertiary);
      }
      .workshop-hero__particle:nth-child(3n + 1) {
        color: var(--mat-sys-secondary);
      }
      @keyframes workshop-hero-ember-rise {
        0% {
          transform: translate3d(0, 0, 0);
          opacity: 0;
        }
        12% {
          opacity: 0.65;
        }
        30% {
          transform: translate3d(calc(var(--ember-drift) * 0.4), -30%, 0);
        }
        50% {
          transform: translate3d(calc(var(--ember-drift) * 0.3), -50%, 0);
          opacity: 0.5;
        }
        75% {
          transform: translate3d(calc(var(--ember-drift) * 0.85), -75%, 0);
          opacity: 0.3;
        }
        100% {
          transform: translate3d(var(--ember-drift), -110%, 0);
          opacity: 0;
        }
      }
      .workshop-hero__motion-toggle {
        position: absolute;
        right: 12px;
        bottom: 8px;
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--line);
        border-radius: 50%;
        background: var(--panel);
        color: var(--muted);
        cursor: pointer;
      }
      .workshop-hero__motion-toggle:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }
      .workshop-hero__motion-toggle mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .workshop-hero__hero--paused .workshop-hero__particle,
      .workshop-hero__hero--paused .workshop-hero__hero-art {
        animation-play-state: paused;
      }
      .workshop-hero__hero-kicker {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 9px;
        font-weight: 750;
        letter-spacing: 2.5px;
        color: var(--muted);
      }
      .workshop-hero__hero-kicker > span {
        width: 6px;
        height: 6px;
        background: var(--soft);
        border-radius: 50%;
      }
      h1 {
        font-size: clamp(32px, 4.5vw, 53px);
        font-weight: 500;
        letter-spacing: -2px;
        line-height: 1.13;
        margin: 23px 0 20px;
      }
      h1 em {
        font-family: Georgia, serif;
        font-weight: 400;
        color: var(--accent);
      }
      .workshop-hero__hero-copy p {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.8;
        margin: 0;
      }
      .workshop-hero__hero-tags {
        display: flex;
        gap: 25px;
        margin-top: 23px;
        color: var(--muted);
        font-size: 10px;
      }
      .workshop-hero__hero-tags span {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .workshop-hero__hero-tags mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .workshop-hero__hero-art {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 240px;
        animation: workshop-hero-art-sway 7s ease-in-out infinite;
      }
      @keyframes workshop-hero-art-sway {
        0%, 100% {
          translate: -4px 3px;
          rotate: -1deg;
        }
        50% {
          translate: 8px -7px;
          rotate: 1.5deg;
        }
      }
      .workshop-hero__orb {
        position: absolute;
        border-radius: 50%;
      }
      .workshop-hero__orb--one {
        background: var(--primary-soft);
        width: 210px;
        height: 210px;
        right: 0;
        top: 32px;
      }
      .workshop-hero__orb--two {
        border: 1px solid var(--line);
        width: 235px;
        height: 235px;
        left: 0;
        top: 5px;
      }
      .workshop-hero__art-card {
        position: relative;
        width: 156px;
        height: 187px;
        background: var(--panel);
        box-shadow: 0 16px 28px
          color-mix(in srgb, var(--mat-sys-shadow) 12%, transparent);
        border-radius: 15px;
        padding: 19px;
        transform: rotate(-9deg);
      }
      .workshop-hero__art-icon {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: var(--primary-soft);
        color: var(--on-primary-soft);
        margin-bottom: 13px;
      }
      .workshop-hero__art-card > span {
        font-size: 6px;
        letter-spacing: 1px;
        color: var(--muted);
      }
      .workshop-hero__art-bars {
        display: flex;
        align-items: flex-end;
        gap: 7px;
        height: 50px;
        margin: 12px 0;
      }
      .workshop-hero__art-bars i {
        width: 18px;
        background: var(--primary-soft);
        border-radius: 4px 4px 0 0;
        height: 25%;
      }
      .workshop-hero__art-bars i:nth-child(2) {
        height: 44%;
      }
      .workshop-hero__art-bars i:nth-child(3) {
        height: 58%;
        background: color-mix(
          in srgb,
          var(--accent) 40%,
          var(--primary-soft)
        );
      }
      .workshop-hero__art-bars i:nth-child(4) {
        height: 76%;
        background: color-mix(
          in srgb,
          var(--accent) 70%,
          var(--primary-soft)
        );
      }
      .workshop-hero__art-bars i:nth-child(5) {
        height: 100%;
        background: var(--accent);
      }
      .workshop-hero__art-line {
        height: 4px;
        border-radius: 4px;
        background: var(--soft);
        width: 100%;
        margin-top: 7px;
      }
      .workshop-hero__art-line.workshop-hero__art-line--short {
        width: 65%;
      }
      .workshop-hero__art-check {
        position: absolute;
        bottom: 40px;
        right: 20px;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        background: var(--accent);
        color: var(--mat-sys-on-primary);
        border: 5px solid var(--line);
        border-radius: 50%;
      }
      .workshop-hero__spark {
        position: absolute;
        color: var(--accent);
      }
      .workshop-hero__spark--one {
        top: 10px;
        right: 35px;
        font-size: 28px;
      }
      .workshop-hero__spark--two {
        bottom: 22px;
        left: 15px;
        font-size: 33px;
      }
      @media (max-width: 900px) {
        .workshop-hero__hero {
          grid-template-columns: minmax(0, 1fr) 190px;
          gap: 20px;
        }
        .workshop-hero__hero-art {
          transform: scale(0.8);
          transform-origin: center;
        }
        .workshop-hero__hero {
          padding-top: 32px;
          padding-bottom: 32px;
        }
      }
      @media (max-width: 600px) {
        .workshop-hero__particle:nth-child(n + 37) {
          display: none;
        }
        .workshop-hero__hero {
          grid-template-columns: 1fr;
          gap: 0;
          padding-bottom: 52px;
        }
        .workshop-hero__hero-art {
          display: none;
        }
        h1 {
          font-size: 36px;
        }
        .workshop-hero__hero-tags {
          gap: 15px;
        }
        .workshop-hero__desktop-break {
          display: none;
        }
        .workshop-hero__hero-copy p {
          font-size: 12px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .workshop-hero__embers,
        .workshop-hero__motion-toggle {
          display: none;
        }
        .workshop-hero__particle,
        .workshop-hero__hero-art {
          animation: none;
        }
      }
    `,
  ],
})
export class WorkshopHeroComponent {
  readonly motionPaused = signal(false);
  readonly particles = Array.from({ length: 72 }, (_, index) => ({
    left: (index * 37) % 100,
    size: 2 + (index % 4),
    duration: 3.2 + ((index * 7) % 23) / 10,
    delay: -((index * 13) % 53) / 10,
  }));
}
