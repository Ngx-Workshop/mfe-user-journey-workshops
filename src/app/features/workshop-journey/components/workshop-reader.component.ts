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
import { Workshop } from '../models/workshop.models';

@Component({
  selector: 'ngx-workshop-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, NgxEditorJs2Component],
  template: `
    <section class="reader" aria-label="Active workshop">
      <button mat-button (click)="exit.emit()" [disabled]="busy()">
        Back to workshops
      </button>
      <p class="reader__level">Level {{ workshop().level }}</p>
      <h2>{{ workshop().name }}</h2>
      <p>{{ workshop().summary }}</p>
      <nav class="reader__outline" aria-label="Workshop contents">
        @for (entry of entries(); track entry._id) {
          @if (entry.kind === 'PAGE') {
            <button
              mat-button
              [attr.aria-current]="
                pageId() === entry._id ? 'step' : null
              "
              (click)="read.emit(entry._id)"
              [disabled]="busy()"
            >
              {{ entry.name }}
              {{
                workshop().viewedPageIds.includes(entry._id)
                  ? '(seen)'
                  : ''
              }}
            </button>
          } @else if (entry.kind === 'ASSESSMENT_TEST') {
            @if (example()) {
              <button
                mat-button
                (click)="assess.emit(entry.resourceId!)"
                [disabled]="
                  busy() ||
                  workshop().completedAssessmentIds.includes(
                    entry.resourceId!
                  )
                "
              >
                {{ entry.name }}
                {{
                  workshop().completedAssessmentIds.includes(
                    entry.resourceId!
                  )
                    ? '(completed)'
                    : '(assessment)'
                }}
              </button>
            } @else {
              <a mat-button [href]="assessmentUrl()"
                >{{ entry.name }}
                {{
                  workshop().completedAssessmentIds.includes(
                    entry.resourceId!
                  )
                    ? '(completed)'
                    : '(assessment)'
                }}</a
              >
            }
          } @else {
            <p class="reader__reference">
              {{ entry.name }} — coding lab: {{ entry.resourceId }}
            </p>
          }
        } @empty {
          <p>No lesson pages have been added to this workshop.</p>
        }
      </nav>
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
        <article class="reader__content" aria-label="Lesson content">
          <p class="reader__notice">
            Edits here are temporary and are not saved.
          </p>
          <ngx-editor-js2
            [blocks]="lessonBlocks"
            [requestBlocks]="null"
          />
        </article>
      }
      @if (pages().length > 1) {
        <div class="reader__navigation">
          <button
            mat-button
            [disabled]="busy() || pageIndex() <= 0"
            (click)="move(-1)"
          >
            Previous lesson
          </button>
          <span
            >Lesson {{ pageIndex() + 1 }} of
            {{ pages().length }}</span
          >
          <button
            mat-button
            [disabled]="busy() || pageIndex() >= pages().length - 1"
            (click)="move(1)"
          >
            Next lesson
          </button>
        </div>
      }
      <div class="reader__completion" aria-live="polite">
        @if (!example() && workshop().assessmentCount > 0 && !workshop().assessmentsCompleted) {
          <p>After submitting the assessment, return here and refresh progress.</p>
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
            This workshop completes automatically once you have seen
            every page and completed its assessments.
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
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .reader {
        padding: 1.5rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 1rem;
      }
      .reader__level {
        color: var(--mat-sys-primary);
      }
      .reader__outline,
      .reader__navigation {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .reader__outline [aria-current] {
        background: var(--mat-sys-secondary-container);
      }
      .reader__content {
        padding: 1.5rem;
        margin-block: 1.5rem;
        max-width: 750px;
        min-width: 0;
        background: var(--mat-sys-surface-container-low);
        border-radius: var(--mat-sys-corner-medium);
        overflow-wrap: anywhere;
      }
      .reader__completion {
        display: grid;
        justify-items: start;
        gap: 1rem;
        border-top: 1px solid var(--mat-sys-outline-variant);
        margin-top: 1rem;
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
  readonly pageId = input('');
  readonly blocks = input<NgxEditorJsBlock[] | null>(null);
  readonly loading = input(false);
  readonly error = input('');
  readonly busy = input(false);
  readonly read = output<string>();
  readonly seen = output<string>();
  readonly assess = output<string>();
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
