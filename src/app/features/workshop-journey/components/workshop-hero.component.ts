import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-workshop-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
  <header class="workshop-hero__hero">
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
        <span><mat-icon>schedule</mat-icon>At your own pace</span><span><mat-icon>insights</mat-icon>Progress that stays</span>
      </div>
    </div>
    <div class="workshop-hero__hero-art" aria-hidden="true">
      <div class="workshop-hero__orb workshop-hero__orb--one"></div>
      <div class="workshop-hero__orb workshop-hero__orb--two"></div>
      <span class="workshop-hero__spark workshop-hero__spark--one">✦</span><span class="workshop-hero__spark workshop-hero__spark--two">✧</span>
      <div class="workshop-hero__art-card">
        <div class="workshop-hero__art-icon"><mat-icon>auto_stories</mat-icon></div>
        <span>YOUR NEXT CHAPTER</span>
        <div class="workshop-hero__art-bars">
          <i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="workshop-hero__art-line"></div>
        <div class="workshop-hero__art-line workshop-hero__art-line--short"></div>
      </div>
      <div class="workshop-hero__art-check"><mat-icon>check</mat-icon></div>
    </div>
  </header>
  `,
  styles: [`
:host { display: block; }
* { box-sizing: border-box; }
.workshop-hero__hero {
    padding: 45px clamp(22px, 5vw, 65px); display: grid; grid-template-columns: minmax(0, 1fr) 260px;
    gap: 35px; overflow: hidden; background: var(--soft); border-bottom: 1px solid var(--line);
  }
.workshop-hero__hero-kicker {
    display: flex; align-items: center; gap: 9px; font-size: 9px; font-weight: 750;
    letter-spacing: 2.5px; color: var(--muted);
  }
.workshop-hero__hero-kicker > span { width: 6px; height: 6px; background: var(--soft); border-radius: 50%; }
h1 {
    font-size: clamp(32px, 4.5vw, 53px); font-weight: 500; letter-spacing: -2px; line-height: 1.13;
    margin: 23px 0 20px;
  }
h1 em { font-family: Georgia, serif; font-weight: 400; color: var(--accent); }
.workshop-hero__hero-copy p { color: var(--muted); font-size: 13px; line-height: 1.8; margin: 0; }
.workshop-hero__hero-tags { display: flex; gap: 25px; margin-top: 23px; color: var(--muted); font-size: 10px; }
.workshop-hero__hero-tags span { display: flex; gap: 6px; align-items: center; }
.workshop-hero__hero-tags mat-icon { font-size: 15px; width: 15px; height: 15px; }
.workshop-hero__hero-art { position: relative; display: grid; place-items: center; min-height: 240px; }
.workshop-hero__orb { position: absolute; border-radius: 50%; }
.workshop-hero__orb--one { background: var(--primary-soft); width: 210px; height: 210px; right: 0; top: 32px; }
.workshop-hero__orb--two { border: 1px solid var(--line); width: 235px; height: 235px; left: 0; top: 5px; }
.workshop-hero__art-card {
    position: relative; width: 156px; height: 187px; background: var(--panel);
    box-shadow: 0 16px 28px color-mix(in srgb, var(--mat-sys-shadow) 12%, transparent);
    border-radius: 15px; padding: 19px; transform: rotate(-9deg);
  }
.workshop-hero__art-icon {
    width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px;
    background: var(--primary-soft); color: var(--on-primary-soft); margin-bottom: 13px;
  }
.workshop-hero__art-card > span { font-size: 6px; letter-spacing: 1px; color: var(--muted); }
.workshop-hero__art-bars { display: flex; align-items: flex-end; gap: 7px; height: 50px; margin: 12px 0; }
.workshop-hero__art-bars i { width: 18px; background: var(--primary-soft); border-radius: 4px 4px 0 0; height: 25%; }
.workshop-hero__art-bars i:nth-child(2) { height: 44%; }
.workshop-hero__art-bars i:nth-child(3) {
    height: 58%; background: color-mix(in srgb, var(--accent) 40%, var(--primary-soft));
  }
.workshop-hero__art-bars i:nth-child(4) {
    height: 76%; background: color-mix(in srgb, var(--accent) 70%, var(--primary-soft));
  }
.workshop-hero__art-bars i:nth-child(5) { height: 100%; background: var(--accent); }
.workshop-hero__art-line { height: 4px; border-radius: 4px; background: var(--soft); width: 100%; margin-top: 7px; }
.workshop-hero__art-line.workshop-hero__art-line--short { width: 65%; }
.workshop-hero__art-check {
    position: absolute; bottom: 40px; right: 20px; width: 44px; height: 44px; display: grid;
    place-items: center; background: var(--accent); color: var(--mat-sys-on-primary);
    border: 5px solid var(--line); border-radius: 50%;
  }
.workshop-hero__spark { position: absolute; color: var(--accent); }
.workshop-hero__spark--one { top: 10px; right: 35px; font-size: 28px; }
.workshop-hero__spark--two { bottom: 22px; left: 15px; font-size: 33px; }
@media (max-width: 900px) {
.workshop-hero__hero { grid-template-columns: minmax(0, 1fr) 190px; gap: 20px; }
.workshop-hero__hero-art { transform: scale(0.8); transform-origin: center; }
.workshop-hero__hero { padding-top: 32px; padding-bottom: 32px; }
}
@media (max-width: 600px) {
.workshop-hero__hero { grid-template-columns: 1fr; gap: 0; }
.workshop-hero__hero-art { display: none; }
h1 { font-size: 36px; }
.workshop-hero__hero-tags { gap: 15px; }
.workshop-hero__desktop-break { display: none; }
.workshop-hero__hero-copy p { font-size: 12px; }
}  `],
})
export class WorkshopHeroComponent {}
