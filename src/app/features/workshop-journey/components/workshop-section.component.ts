import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SectionProgress, Workshop } from '../models/workshop.models';

@Component({
  selector: 'ngx-workshop-section', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="section" [attr.aria-label]="section().title">
      <header class="section__header">
        <div><h2>{{ section().title }}</h2><p>{{ section().description }}</p></div>
        @if (section().assessmentCompleted) { <span class="section__badge">{{ section().completedCount }} / {{ section().totalCount }} completed</span> }
      </header>
      @if (!section().assessmentCompleted) {
        <div class="section__placement"><mat-icon>explore</mat-icon><div><h3>Find your starting point</h3><p>Take the initial assessment to unlock workshops in this section.</p>
          @if (example()) { <button mat-flat-button [disabled]="busy()" (click)="assess.emit(section().sectionId)">Take initial assessment</button> }
          @else if (section().assessmentAvailable) { <a mat-flat-button [href]="assessmentUrl()" (click)="activity.emit({ url: assessmentUrl(), event: $event })">Take initial assessment</a> }
          @else { <p>No initial assessment is available yet. Check back when one has been added.</p> }
        </div></div>
      } @else {
        @if (!completed()) { <p class="section__guidance">Level {{ section().unlockedLevel }} unlocked · Complete every workshop at a level to unlock the next.</p> }
        @for (group of levels(); track group.level) {
          <div class="section__level"><h3>Level {{ group.level }}</h3><span>{{ group.workshops.length }} {{ group.workshops.length === 1 ? 'workshop' : 'workshops' }}</span></div>
          <div class="section__list">
          @for (workshop of group.workshops; track workshop._id) {
            <article class="section__row">
              <span class="section__mark" aria-hidden="true"><mat-icon>{{ completed() ? 'task_alt' : workshop.status === 'in-progress' ? 'bookmark' : 'auto_stories' }}</mat-icon></span>
              <div class="section__copy">
                <span class="section__status" [class.section__status--active]="workshop.status === 'in-progress'">{{ completed() ? 'Completed' : workshop.status === 'in-progress' ? 'In progress' : 'Ready to start' }}</span>
                <h4>{{ workshop.name }}</h4><p>{{ workshop.summary }}</p>
                <span class="section__meta">{{ workshop.viewedPageIds.length }} / {{ workshop.pageCount }} pages seen @if (workshop.assessmentCount > 0) { · {{ workshop.assessmentsCompleted ? 'Assessments completed' : 'Assessment pending' }} }</span>
              </div>
              @if (completed()) { <button mat-stroked-button [disabled]="busy()" (click)="retake.emit(workshop)"><mat-icon>replay</mat-icon>Retake workshop</button> }
              @else { <button mat-flat-button [disabled]="busy()" (click)="start.emit(workshop)">{{ workshop.status === 'in-progress' ? 'Resume workshop' : 'Start workshop' }}<mat-icon>arrow_forward</mat-icon></button> }
            </article>
          }
          </div>
        }
        @if (!levels().length && !query()) { <p class="section__guidance">{{ completed() ? 'No completed workshops in this section yet.' : section().totalCount === 0 ? 'No workshops have been added yet.' : 'You’ve finished all currently available workshops in this section.' }}</p> }
        @if (!completed() && section().lockedCount > 0) { <p class="section__locked"><mat-icon>lock_outline</mat-icon>{{ section().lockedCount }} more {{ section().lockedCount === 1 ? 'workshop unlocks' : 'workshops unlock' }} as you progress.</p> }
      }
    </section>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    * { box-sizing: border-box; }
    .section { margin-block: 24px; }
    .section__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    h2 { margin: 0 0 8px; font-size: 25px; } p { margin: 0; line-height: 1.7; color: var(--muted); font-size: 13px; }
    .section__badge { white-space: nowrap; border-radius: 20px; padding: 8px 12px; font-size: 11px; background: var(--soft); color: var(--muted); }
    .section__guidance { margin-top: 16px; }
    .section__level { display: flex; gap: 16px; align-items: center; margin: 26px 0 12px; }
    .section__level h3 { margin: 0; font-size: 14px; } .section__level span { color: var(--muted); font-size: 11px; }
    .section__list { display: grid; gap: 12px; }
    .section__row { display: flex; align-items: center; gap: 22px; padding: 24px; border: 1px solid var(--line); border-radius: 16px; background: var(--panel); }
    .section__mark { display: grid; place-items: center; width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px; background: var(--primary-soft); color: var(--on-primary-soft); }
    .section__copy { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    h4 { margin: 8px 0; font-size: 19px; } .section__meta { display: block; color: var(--muted); font-size: 11px; margin-top: 10px; line-height: 1.6; }
    .section__status { font-size: 10px; color: var(--muted); } .section__status--active { color: var(--accent); font-weight: 600; }
    .section__locked { display: flex; align-items: center; gap: 8px; margin-top: 18px; font-size: 12px; }
    .section__locked mat-icon { font-size: 17px; width: 17px; height: 17px; flex-shrink: 0; }
    .section__placement { display: flex; gap: 16px; margin-top: 20px; padding: 24px; background: var(--soft); border-radius: 16px; }
    .section__placement > mat-icon { color: var(--accent); flex-shrink: 0; } .section__placement h3 { margin: 0 0 8px; font-size: 18px; } .section__placement button, .section__placement a { margin-top: 16px; }
    button:focus-visible, a:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
    @media (max-width: 650px) { .section__header { flex-direction: column; } .section__row { flex-wrap: wrap; gap: 14px; padding: 20px; } .section__copy { flex-basis: calc(100% - 62px); } .section__row button { margin-left: 62px; max-width: calc(100% - 62px); white-space: normal; height: auto; min-height: 40px; } }
  `],
})
export class WorkshopSectionComponent {
  readonly section = input.required<SectionProgress>();
  readonly completed = input(false);
  readonly query = input('');
  readonly busy = input(false);
  readonly example = input(false);
  readonly assessmentUrl = input.required<string>();
  readonly start = output<Workshop>();
  readonly retake = output<Workshop>();
  readonly assess = output<string>();
  readonly activity = output<{ url: string; event: MouseEvent }>();
  readonly levels = computed(() => {
    const section = this.section();
    const query = this.query().trim().toLowerCase();
    const matchesSection = `${section.title} ${section.description}`.toLowerCase().includes(query);
    const workshops = section.workshops.filter(w => (w.status === 'completed') === this.completed() &&
      (matchesSection || `${w.name} ${w.summary}`.toLowerCase().includes(query)));
    return [...new Set(workshops.map(w => w.level))].sort((a, b) => a - b).map(level => ({ level,
      workshops: workshops.filter(w => w.level === level).sort((a, b) =>
        Number(b.status === 'in-progress') - Number(a.status === 'in-progress') || a.sortId - b.sortId || a.name.localeCompare(b.name)),
    }));
  });
}
