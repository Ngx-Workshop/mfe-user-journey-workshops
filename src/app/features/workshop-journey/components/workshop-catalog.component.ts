import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SectionProgress, Workshop } from '../models/workshop.models';
import { WorkshopSectionComponent } from './workshop-section.component';

@Component({
  selector: 'ngx-workshop-catalog', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, WorkshopSectionComponent],
  template: `
    <header class="catalog__header"><div><span class="catalog__eyebrow">YOUR LEARNING PATH</span><h2>{{ view() === 'completed' ? 'Revisit what you’ve learned' : 'Your next workshops' }}</h2><p>{{ view() === 'completed' ? 'Retake a workshop from the first lesson. Your completion and unlocked levels stay yours.' : 'Pick up where you left off, or start something new.' }}</p></div>
      <span class="catalog__total">{{ completedCount() }} / {{ totalCount() }} completed</span>
    </header>
    <div class="catalog__toolbar">
      <nav class="catalog__views" aria-label="Workshop lists">
        <button [attr.aria-pressed]="view() === 'active'" (click)="viewChange.emit('active')">Continue learning <span>{{ activeCount() }}</span></button>
        <button [attr.aria-pressed]="view() === 'completed'" (click)="viewChange.emit('completed')">Completed <span>{{ completedCount() }}</span></button>
      </nav>
      <label class="catalog__search"><mat-icon>search</mat-icon><input type="search" aria-label="Search workshops" placeholder="Search workshops or topics" [value]="query()" (input)="queryChange.emit(inputValue($event))" /></label>
    </div>
    @for (section of visible(); track section.sectionId) {
      <ngx-workshop-section [section]="section" [completed]="view() === 'completed'" [query]="query()" [busy]="busy()" [example]="example()" [assessmentUrl]="assessmentLinks()[section.sectionId] || ''" (start)="start.emit($event)" (retake)="retake.emit($event)" (assess)="assess.emit($event)" (activity)="activity.emit($event)" />
    } @empty {
      <div class="catalog__empty" role="status"><mat-icon>{{ query().trim() ? 'search_off' : 'auto_stories' }}</mat-icon>
        <h3>{{ query().trim() ? 'No matching workshops' : view() === 'completed' ? 'Your completed workshops will appear here' : 'No workshop sections have been added yet' }}</h3>
        <p>{{ query().trim() ? 'Try another workshop name or topic.' : view() === 'completed' ? 'Keep learning, then come back to revisit your completed workshops.' : 'Check back for new workshops.' }}</p>
        @if (query().trim()) { <button mat-button (click)="queryChange.emit('')">Clear search</button> }
        @else if (view() === 'completed') { <button mat-button (click)="viewChange.emit('active')">Continue learning</button> }
      </div>
    }
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    * { box-sizing: border-box; }
    .catalog__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
    .catalog__eyebrow { font-size: 10px; letter-spacing: 1.6px; color: var(--accent); }
    h2 { font-size: clamp(25px, 3vw, 32px); margin: 12px 0; } p { color: var(--muted); font-size: 13px; line-height: 1.7; margin: 0; }
    .catalog__total { color: var(--muted); white-space: nowrap; font-size: 12px; padding-top: 4px; }
    .catalog__toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin: 26px 0 32px; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
    .catalog__views { display: flex; gap: 8px; flex-wrap: wrap; }
    .catalog__views button { border: 1px solid transparent; border-radius: 24px; padding: 12px 16px; font: inherit; font-size: 12px; cursor: pointer; background: var(--soft); color: var(--muted); }
    .catalog__views button[aria-pressed=true] { background: var(--primary-soft); color: var(--on-primary-soft); border-color: var(--accent); }
    .catalog__views span { padding-left: 8px; font-weight: 600; }
    .catalog__search { display: flex; align-items: center; gap: 10px; border: 1px solid var(--line); background: var(--panel); color: var(--muted); border-radius: 12px; padding: 12px; width: min(100%, 320px); }
    input { min-width: 0; width: 100%; border: 0; background: none; color: var(--ink); font: inherit; font-size: 12px; }
    .catalog__empty { text-align: center; padding: 44px 20px; background: var(--panel); border: 1px solid var(--line); border-radius: 16px; }
    .catalog__empty > mat-icon { color: var(--accent); } .catalog__empty button { margin-top: 18px; }
    button:focus-visible, input:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
    @media (max-width: 650px) { .catalog__header { flex-direction: column; gap: 12px; } .catalog__toolbar { align-items: stretch; } .catalog__search { width: 100%; } }
  `],
})
export class WorkshopCatalogComponent {
  readonly sections = input.required<SectionProgress[]>();
  readonly assessmentLinks = input.required<Record<string, string>>();
  readonly view = input<'active' | 'completed'>('active');
  readonly query = input('');
  readonly busy = input(false);
  readonly example = input(false);
  readonly viewChange = output<'active' | 'completed'>();
  readonly queryChange = output<string>();
  readonly start = output<Workshop>();
  readonly retake = output<Workshop>();
  readonly assess = output<string>();
  readonly activity = output<{ url: string; event: MouseEvent }>();
  readonly completedCount = computed(() => this.sections().reduce((sum, s) => sum + s.completedCount, 0));
  readonly totalCount = computed(() => this.sections().reduce((sum, s) => sum + s.totalCount, 0));
  readonly activeCount = computed(() => this.sections().flatMap(s => s.workshops).filter(w => w.status !== 'completed').length);
  readonly visible = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.sections().filter(section => {
      const matchesSection = `${section.title} ${section.description}`.toLowerCase().includes(query);
      if (this.view() === 'active' && !section.assessmentCompleted) return matchesSection;
      const workshops = section.workshops.filter(w => (w.status === 'completed') === (this.view() === 'completed'));
      return (!query && this.view() === 'active') || workshops.some(w => matchesSection || `${w.name} ${w.summary}`.toLowerCase().includes(query));
    });
  });
  inputValue(event: Event) { return (event.target as HTMLInputElement).value; }
}
