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
    const particles = host.querySelectorAll<HTMLElement>('.workshop-hero__particle');

    expect(particles.length).toBe(72);
    expect(host.querySelector('.workshop-hero__embers')?.getAttribute('aria-hidden'))
      .toBe('true');
    expect(host.querySelector('.workshop-hero__hero-art')?.getAttribute('aria-hidden'))
      .toBe('true');
    expect(host.querySelector('h1')?.textContent).toContain('One step further.');
    expect(new Set(fixture.componentInstance.particles.map(particle => particle.left)).size)
      .toBe(72);
    expect(new Set(fixture.componentInstance.particles.map(particle => particle.delay)).size)
      .toBeGreaterThan(40);
    for (const particle of particles) {
      expect(parseFloat(particle.style.animationDuration)).toBeGreaterThanOrEqual(3.2);
      expect(parseFloat(particle.style.animationDuration)).toBeLessThanOrEqual(5.4);
      expect(parseFloat(particle.style.animationDelay)).toBeLessThanOrEqual(0);
    }
  });

  it('pauses and resumes the entire decorative effect with an accessible toggle', () => {
    const fixture = TestBed.createComponent(WorkshopHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const button = host.querySelector<HTMLButtonElement>('.workshop-hero__motion-toggle')!;
    const hero = host.querySelector('header')!;

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Pause hero animation');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(hero.classList.contains('workshop-hero__hero--paused')).toBeTrue();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.title).toBe('Resume hero animation');
    expect(button.textContent).toContain('play_arrow');
    button.click();
    fixture.detectChanges();
    expect(hero.classList.contains('workshop-hero__hero--paused')).toBeFalse();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('pause');
  });
});
