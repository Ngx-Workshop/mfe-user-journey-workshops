import {
  ChangeDetectionStrategy,
  Component,
  computed,
  afterRenderEffect,
  input,
  output,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxEditorJs2Component,
  NgxEditorJsBlock,
} from '@tmdjr/ngx-editor-js2';
import { WorkshopOutlineComponent } from './workshop-outline.component';
import { activityUrl } from '../utils/activity-url';
import { Workshop } from '../models/workshop.models';

@Component({
  selector: 'ngx-workshop-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    NgxEditorJs2Component,
    WorkshopOutlineComponent,
  ],
  template: `
    <section class="reader" aria-label="Active workshop">
      <button mat-button (click)="exit.emit()" [disabled]="busy()">
        Back to workshops
      </button>
      <p class="reader__level">Level {{ workshop().level }}</p>
      <h2>{{ workshop().name }}</h2>
      <p>{{ workshop().summary }}</p>
      <div class="reader__workspace">
        <ngx-workshop-outline
          [workshop]="workshop()"
          [pageId]="pageId()"
          [busy]="busy() || !!visitError()"
          [example]="example()"
          [assessmentUrl]="assessmentUrl()"
          [labUrl]="labUrl()"
          (read)="read.emit($event)"
          (assess)="assess.emit($event)"
          (activity)="activity.emit($event)"
        />
        <div class="reader__lesson">
          @if (current(); as lesson) {
            <p class="reader__level">
              LESSON {{ pageIndex() + 1 }} OF {{ pages().length }}
            </p>
            <h3>{{ lesson.name }}</h3>
          }
          @if (loading()) {
            <p role="status">Loading lesson…</p>
          }
          @if (error()) {
            <p role="alert">{{ error() }}</p>
            <button mat-button (click)="read.emit(pageId())">
              Retry lesson
            </button>
          }
          @if (blocks(); as lessonBlocks) {
            <article
              class="reader__content"
              aria-label="Lesson content"
            >
              <p class="reader__notice">
                Edits here are temporary and are not saved.
              </p>
              <ngx-editor-js2
                [blocks]="lessonBlocks"
                [requestBlocks]="null"
              />
            </article>
          }
          @if (current()) {
            <div
              class="reader__navigation"
              aria-label="Lesson navigation"
            >
              <button
                mat-button
                [disabled]="busy() || pageIndex() <= 0"
                (click)="move(-1)"
              >
                Previous lesson
              </button>
              @if (next(); as entry) {
                @if (entry.kind === 'PAGE') {
                  <button
                    mat-flat-button
                    [disabled]="
                      busy() ||
                      loading() ||
                      !!error() ||
                      !!visitError()
                    "
                    (click)="read.emit(entry._id)"
                  >
                    Continue: {{ entry.name }}
                  </button>
                } @else if (
                  entry.kind === 'ASSESSMENT_TEST' && example()
                ) {
                  <button
                    mat-flat-button
                    [disabled]="busy()"
                    (click)="assess.emit(entry.resourceId!)"
                  >
                    Continue: {{ entry.name }}
                  </button>
                } @else if (nextUrl(); as href) {
                  @if (
                    busy() || loading() || error() || visitError()
                  ) {
                    <button mat-flat-button disabled>
                      Continue: {{ entry.name }}
                    </button>
                  } @else {
                    <a
                      mat-flat-button
                      [href]="href"
                      (click)="
                        activity.emit({ url: href, event: $event })
                      "
                      >Continue: {{ entry.name }}</a
                    >
                  }
                }
              } @else {
                <button
                  mat-flat-button
                  [disabled]="busy()"
                  (click)="exit.emit()"
                >
                  Back to workshops
                </button>
              }
            </div>
          }
          <div class="reader__completion" aria-live="polite">
            @if (
              !example() &&
              workshop().assessmentCount > 0 &&
              !workshop().assessmentsCompleted
            ) {
              <p>
                After you submit your assignment, you’ll return to
                this workshop automatically. Your progress updates
                when you return.
              </p>
            }
            <p>
              {{ workshop().viewedPageIds.length }} /
              {{ workshop().pageCount }} pages seen
            </p>
            <p>
              {{
                workshop().assessmentsCompleted
                  ? 'Assessments completed'
                  : 'Complete the workshop assessments to finish'
              }}
            </p>
            @if (workshop().status === 'completed') {
              <p>
                Workshop complete. Your available workshops have been
                updated.
              </p>
            } @else {
              <p>
                This workshop completes automatically once you have
                seen every page and completed its assessments.
              </p>
            }
            @if (visitPending()) {
              <p role="status">Saving page progress…</p>
            }
            @if (visitError()) {
              <p role="alert">{{ visitError() }}</p>
              <button
                mat-button
                (click)="seen.emit(pageId())"
                [disabled]="visitPending()"
              >
                Retry saving progress
              </button>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .reader {
        min-width: 0;
      }
      .reader__level {
        color: var(--accent);
        font-size: 11px;
        letter-spacing: 1.5px;
      }
      h2 {
        font-size: clamp(26px, 3vw, 36px);
        margin-bottom: 12px;
      }
      .reader > p {
        color: var(--muted);
        line-height: 1.7;
      }
      .reader__workspace {
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        gap: 28px;
        margin-top: 28px;
        align-items: start;
      }
      .reader__lesson {
        min-width: 0;
      }
      .reader__content {
        padding: clamp(16px, 3vw, 28px);
        margin-block: 24px;
        min-width: 0;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 16px;
        overflow-wrap: anywhere;
      }
      .reader__navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }
      .reader__navigation a,
      .reader__navigation button {
        height: auto;
        min-height: 40px;
        white-space: normal;
        text-align: left;
      }
      @media (max-width: 850px) {
        .reader__workspace {
          grid-template-columns: 1fr;
        }
      }
      .reader__completion {
        display: grid;
        justify-items: start;
        gap: 12px;
        padding-top: 20px;
        border-top: 1px solid var(--mat-sys-outline-variant);
        margin-top: 1rem;
      }
      .reader__completion p {
        margin: 0;
        line-height: 1.6;
      }
      .reader__notice {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
      .reader__reference {
        padding: 0.5rem;
      }
    `,
  ],
})
export class WorkshopReaderComponent {
  readonly workshop = input.required<Workshop>();
  readonly assessmentUrl = input.required<string>();
  readonly labUrl = input.required<string>();
  readonly pageId = input('');
  readonly blocks = input<NgxEditorJsBlock[] | null>(null);
  readonly loading = input(false);
  readonly error = input('');
  readonly busy = input(false);
  readonly read = output<string>();
  readonly seen = output<string>();
  readonly assess = output<string>();
  readonly activity = output<{ url: string; event: MouseEvent }>();
  readonly example = input(false);
  readonly visitPending = input(false);
  readonly visitError = input('');
  readonly exit = output();
  readonly entries = computed(() =>
    this.workshop()
      .workshopDocuments.slice()
      .sort((a, b) => a.sortId - b.sortId)
  );
  readonly pages = computed(() =>
    this.entries().filter((p) => p.kind === 'PAGE')
  );
  readonly pageIndex = computed(() =>
    this.pages().findIndex((p) => p._id === this.pageId())
  );
  readonly current = computed(
    () => this.pages()[this.pageIndex()] ?? null
  );
  readonly next = computed(
    () =>
      this.entries()
        .slice(
          this.entries().findIndex((e) => e._id === this.pageId()) + 1
        )
        .find(
          (e) =>
            e.kind !== 'ASSESSMENT_TEST' ||
            !e.resourceId ||
            !this.workshop().completedAssessmentIds.includes(
              e.resourceId
            )
        ) ?? null
  );
  readonly nextUrl = computed(() => {
    const entry = this.next();
    return entry
      ? activityUrl(
          entry.kind === 'CODING_LAB'
            ? this.labUrl()
            : this.assessmentUrl(),
          entry.kind === 'CODING_LAB' ? 'lab' : 'test',
          entry.resourceId
        )
      : null;
  });
  move(offset: number) {
    const page = this.pages()[this.pageIndex() + offset];
    if (page) this.read.emit(page._id);
  }

  constructor() {
    let previous: NgxEditorJsBlock[] | null = null;
    afterRenderEffect(() => {
      const blocks = this.blocks();
      const loading = this.loading();
      const pageId = this.pageId();
      if (!blocks) {
        previous = null;
        return;
      }
      if (!loading && blocks !== previous) {
        previous = blocks;
        untracked(() => this.seen.emit(pageId));
      }
    });
  }
}
