import { By } from '@angular/platform-browser';
import { NgxJourneyHero } from '@tmdjr/ngx-shared-headers';
import { TestBed } from '@angular/core/testing';
import { WorkshopHeroComponent } from '../../../../../src/app/features/workshop-journey/components/workshop-hero.component';

describe('Workshop hero', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [WorkshopHeroComponent] });
  });

  it('renders a dense, staggered decorative field without changing learner copy', () => {
    const fixture = TestBed.createComponent(WorkshopHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const particles = host.querySelectorAll<HTMLElement>('.journey-hero__particle');

    const hero = fixture.debugElement.query(By.directive(NgxJourneyHero))
      .componentInstance as NgxJourneyHero;

    expect(particles.length).toBe(72);
    expect(host.querySelector('.journey-hero__embers')?.getAttribute('aria-hidden'))
      .toBe('true');
    expect(host.querySelector('.journey-hero__hero-art')?.getAttribute('aria-hidden'))
      .toBe('true');
    expect(host.querySelector('h1')?.textContent).toContain('Your workshops.');
    expect(host.querySelector('h1')?.textContent).toContain('One step further.');
    expect(host.querySelector('p')?.textContent).toContain('Keep learning, one workshop at a time.');
    expect(host.querySelector('.journey-hero__hero-tags')?.textContent).toContain('At your own pace');
    expect(host.querySelector('.journey-hero__hero-tags')?.textContent).toContain('Progress that stays');
    expect(new Set(hero.particles.map(particle => particle.left)).size)
      .toBe(72);
    expect(new Set(hero.particles.map(particle => particle.delay)).size)
      .toBeGreaterThan(40);
    for (const particle of particles) {
      expect(parseFloat(particle.style.animationDuration)).toBeGreaterThanOrEqual(3.2);
      expect(parseFloat(particle.style.animationDuration)).toBeLessThanOrEqual(5.4);
      expect(parseFloat(particle.style.animationDelay)).toBeLessThanOrEqual(0);
    }
  });

  it('concentrates desktop and phone particles on the right with a leftward fade', () => {
    const fixture = TestBed.createComponent(WorkshopHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const particles = [...host.querySelectorAll<HTMLElement>('.journey-hero__particle')];

    for (const count of [72, 36]) {
      const origins = particles.slice(0, count).map(particle => parseFloat(particle.style.left));
      expect(origins.filter(left => left > 50).length).toBeGreaterThanOrEqual(Math.ceil(count * 0.7));
      expect(Math.min(...origins)).toBeGreaterThanOrEqual(8);
      expect(Math.max(...origins)).toBeLessThan(92);
    }
    const layer = host.querySelector<HTMLElement>('.journey-hero__embers')!;
    expect(getComputedStyle(layer).maskImage).toContain('linear-gradient(to right');
    expect(getComputedStyle(layer).maskImage).toContain('85%');
  });

  it('pauses and resumes the entire decorative effect with an accessible toggle', () => {
    const fixture = TestBed.createComponent(WorkshopHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const button = host.querySelector<HTMLButtonElement>('.journey-hero__motion-toggle')!;
    const hero = host.querySelector('header')!;

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Pause hero animation');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(hero.classList.contains('journey-hero__hero--paused')).toBeTrue();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(getComputedStyle(host.querySelector('.journey-hero__particle')!).animationPlayState).toBe('paused');
    expect(getComputedStyle(host.querySelector('ngx-hero-chapter-art')!).animationPlayState).toBe('paused');
    expect(button.title).toBe('Resume hero animation');
    expect(button.textContent).toContain('play_arrow');
    button.click();
    fixture.detectChanges();
    expect(hero.classList.contains('journey-hero__hero--paused')).toBeFalse();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('pause');
  });
});
