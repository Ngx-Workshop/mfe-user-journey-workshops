import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  NgxEditorJs2Component,
  NgxEditorJsBlock,
} from '@tmdjr/ngx-editor-js2';
import { MatButtonModule } from '@angular/material/button';
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
            >
              {{ entry.name }}
            </button>
          } @else if (entry.kind === 'ASSESSMENT_TEST') {
            <a mat-button [href]="assessmentUrl()"
              >{{ entry.name }} (assessment)</a
            >
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
            [disabled]="pageIndex() <= 0"
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
            [disabled]="pageIndex() >= pages().length - 1"
            (click)="move(1)"
          >
            Next lesson
          </button>
        </div>
      }
      <div class="reader__completion">
        <p>
          Completion is your confirmation that you finished the
          workshop, including any referenced exercises.
        </p>
        <label
          ><input
            type="checkbox"
            [checked]="confirmed()"
            (change)="confirmed.set(!confirmed())"
            [disabled]="busy()"
          />
          I have completed this workshop.</label
        >
        <button
          mat-flat-button
          [disabled]="
            !confirmed() || busy() || loading() || !!error()
          "
          (click)="finish.emit()"
        >
          {{ busy() ? 'Saving…' : 'Complete workshop' }}
        </button>
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
  readonly finish = output();
  readonly exit = output();
  readonly confirmed = signal(false);
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
}
