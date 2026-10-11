import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Workshop } from '../models/workshop.models';
import { activityUrl } from '../utils/activity-url';

@Component({
  selector: 'ngx-workshop-outline', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <nav class="outline" aria-label="Workshop contents">
      <h3>In this workshop</h3>
      @for (entry of entries(); track entry._id; let index = $index) {
        <div class="outline__entry" [class.outline__entry--active]="entry.kind === 'PAGE' && entry._id === pageId()">
          <span class="outline__number">{{ index + 1 }}</span>
          <div>
            @if (entry.kind === 'PAGE') {
              <button mat-button [disabled]="busy()" [attr.aria-current]="entry._id === pageId() ? 'step' : null" (click)="read.emit(entry._id)">{{ entry.name }}</button>
              <small>Lesson · {{ workshop().viewedPageIds.includes(entry._id) ? 'Seen' : 'To read' }}</small>
            } @else if (entry.kind === 'ASSESSMENT_TEST' && example()) {
              <button mat-button [disabled]="busy() || completed(entry.resourceId)" (click)="assess.emit(entry.resourceId!)">{{ entry.name }}</button>
              <small>Assessment · {{ completed(entry.resourceId) ? 'Completed' : 'Check understanding' }}</small>
            } @else {
              @if (url(entry); as href) {
                @if (busy()) { <button mat-button disabled>{{ entry.name }}</button> }
                @else { <a mat-button [href]="href" (click)="activity.emit({ url: href, event: $event })">{{ entry.name }}<mat-icon>arrow_forward</mat-icon></a> }
              } @else { <span>{{ entry.name }}</span> }
              <small>{{ entry.kind === 'CODING_LAB' ? 'Coding lab · Optional practice' : 'Assessment · ' + (completed(entry.resourceId) ? 'Completed' : 'Check understanding') }}{{ !entry.resourceId ? ' · Unavailable' : '' }}</small>
            }
          </div>
        </div>
      } @empty { <p>No activities have been added yet.</p> }
    </nav>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .outline { border: 1px solid var(--line); border-radius: 16px; background: var(--panel); padding: 20px 12px; }
    h3 { font-size: 14px; margin: 0 10px 18px; }
    .outline__entry { display: flex; align-items: flex-start; gap: 8px; border-radius: 12px; padding: 10px 6px; }
    .outline__entry--active { background: var(--primary-soft); color: var(--on-primary-soft); }
    .outline__number { padding-top: 10px; font-size: 12px; color: var(--muted); }
    .outline__entry > div { min-width: 0; }
    .outline__entry button, .outline__entry a { height: auto; min-height: 40px; text-align: left; white-space: normal; overflow-wrap: anywhere; }
    small { display: block; margin: 0 12px; color: var(--muted); font-size: 11px; line-height: 1.6; }
  `],
})
export class WorkshopOutlineComponent {
  readonly workshop = input.required<Workshop>();
  readonly assessmentUrl = input.required<string>();
  readonly labUrl = input.required<string>();
  readonly pageId = input('');
  readonly example = input(false);
  readonly busy = input(false);
  readonly read = output<string>();
  readonly assess = output<string>();
  readonly activity = output<{ url: string; event: MouseEvent }>();
  readonly entries = computed(() => this.workshop().workshopDocuments.slice().sort((a, b) => a.sortId - b.sortId));
  completed(id?: string) { return !!id && this.workshop().completedAssessmentIds.includes(id); }
  url(entry: Workshop['workshopDocuments'][number]) { return activityUrl(entry.kind === 'CODING_LAB' ? this.labUrl() : this.assessmentUrl(), entry.kind === 'CODING_LAB' ? 'lab' : 'test', entry.resourceId); }
}
