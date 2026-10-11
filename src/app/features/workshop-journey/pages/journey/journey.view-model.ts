import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Subject,
  catchError,
  concatMap,
  exhaustMap,
  finalize,
  switchMap,
  tap,
} from 'rxjs';
import { WorkshopStore } from '../../state/workshop.store';
import { SampleAnswer, Workshop } from '../../models/workshop.models';
import { NgxEditorJsBlock } from '@tmdjr/ngx-editor-js2';
import { readingBlocks } from '../../utils/reading-blocks';
import { workshopError } from '../../utils/workshop-error';

@Injectable()
export class JourneyViewModel {
  private readonly store = inject(WorkshopStore);
  private readonly router = inject(Router, { optional: true });
  private readonly resets = new Subject<void>();
  private readonly destroy = inject(DestroyRef);
  private readonly commands = new Subject<{
    id: string;
    action: 'start';
  }>();
  private readonly assessments = new Subject<{
    sectionId: string;
    answer: SampleAnswer;
    workshopAssessment: boolean;
  }>();
  private readonly pages = new Subject<{
    id: string;
    pageId: string;
  } | null>();
  private readonly visits = new Subject<{
    id: string;
    pageId: string;
  }>();
  readonly visitError = signal('');
  readonly visitPending = signal(false);
  readonly workshopAssessment = signal(false);
  readonly catalog = this.store.catalog;
  readonly loading = this.store.loading;
  readonly busy = computed(
    () => this.store.busy() || this.visitPending()
  );
  readonly error = this.store.error;
  readonly example = this.store.example;
  readonly selectedId = signal<string | null>(null);
  readonly selected = computed(
    () =>
      this.catalog()
        ?.sections.flatMap((s) => s.workshops)
        .find((w) => w._id === this.selectedId()) ?? null
  );
  readonly pageId = signal('');
  readonly blocks = signal<NgxEditorJsBlock[] | null>(null);
  readonly pageLoading = signal(false);
  readonly pageError = signal('');
  readonly assessmentSection = signal<string | null>(null);
  readonly answer = new FormControl<SampleAnswer | null>(
    null,
    Validators.required
  );
  readonly message = signal('');
  readonly sections = computed(() => this.catalog()?.sections ?? []);
  constructor() {
    this.commands
      .pipe(
        exhaustMap((command) =>
          this.store.command(command.id, command.action).pipe(
            tap(() => {
              this.open(command.id);
            })
          )
        ),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    this.assessments
      .pipe(
        exhaustMap((a) =>
          this.store
            .assess(a.sectionId, a.answer, a.workshopAssessment)
            .pipe(
              tap((result) => {
                this.assessmentSection.set(null);
                this.message.set(
                  a.workshopAssessment
                    ? 'Workshop assessment completed. Progress has been updated.'
                    : result.correct
                      ? 'Correct. Initial assessment completed; level 1 is available.'
                      : 'A component combines a template and behavior. Assessment completed; start with level 1.'
                );
              })
            )
        ),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    this.resets
      .pipe(
        exhaustMap(() =>
          this.store.resetExample().pipe(
            tap(() => {
              this.close();
              this.assessmentSection.set(null);
              this.message.set(
                'Local example reset. Take an initial assessment to begin again.'
              );
            })
          )
        ),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    this.pages
      .pipe(
        switchMap((page) => {
          this.blocks.set(null);
          this.pageError.set('');
          this.pageLoading.set(false);
          if (!page) return EMPTY;
          this.pageLoading.set(true);
          return this.store.page(page.id, page.pageId).pipe(
            tap((reading) =>
              this.blocks.set(readingBlocks(reading.html))
            ),
            catchError((error) => {
              this.pageError.set(workshopError(error));
              return EMPTY;
            }),
            finalize(() => this.pageLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    this.visits
      .pipe(
        concatMap((page) => {
          this.visitPending.set(true);
          this.visitError.set('');
          return this.store.seen(page.id, page.pageId).pipe(
            catchError((error) => {
              this.visitError.set(workshopError(error));
              return EMPTY;
            }),
            finalize(() => this.visitPending.set(false))
          );
        }),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    const search = inject(DOCUMENT).location?.search ?? '';
    this.store.refresh(
      new URLSearchParams(search).get('workshopExample') === 'local'
    );
  }
  refresh() {
    this.store.refresh();
  }
  resetExample() {
    if (this.example() && !this.busy()) this.resets.next();
  }
  changeMode(example: boolean) {
    if (this.router)
      void this.router.navigate([], {
        queryParams: { workshopExample: example ? 'local' : null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    this.close();
    this.assessmentSection.set(null);
    this.message.set('');
    this.store.refresh(example);
  }
  start(workshop: Workshop) {
    if (!this.busy())
      this.commands.next({ id: workshop._id, action: 'start' });
  }
  seen(pageId: string) {
    const workshop = this.selected();
    if (workshop && !workshop.viewedPageIds.includes(pageId))
      this.visits.next({ id: workshop._id, pageId });
  }
  open(id: string) {
    this.selectedId.set(id);
    this.message.set('');
    this.visitError.set('');
    const first = this.selected()
      ?.workshopDocuments.slice()
      .sort((a, b) => a.sortId - b.sortId)
      .find((p) => p.kind === 'PAGE');
    if (first) this.read(first._id);
    else {
      this.pageId.set('');
      this.pages.next(null);
    }
  }
  close() {
    this.assessmentSection.set(null);
    this.visitError.set('');
    this.selectedId.set(null);
    this.pageId.set('');
    this.pages.next(null);
  }
  read(pageId: string) {
    const id = this.selectedId();
    if (id) {
      this.visitError.set('');
      this.pageId.set(pageId);
      this.pages.next({ id, pageId });
    }
  }
  beginAssessment(sectionId: string) {
    this.answer.reset();
    this.workshopAssessment.set(false);
    this.assessmentSection.set(sectionId);
  }
  beginWorkshopAssessment(testId: string) {
    this.answer.reset();
    this.workshopAssessment.set(true);
    this.assessmentSection.set(testId);
  }
  submitAssessment() {
    const sectionId = this.assessmentSection();
    const answer = this.answer.value;
    if (sectionId && answer && !this.busy())
      this.assessments.next({
        sectionId,
        answer,
        workshopAssessment: this.workshopAssessment(),
      });
  }
  assessmentUrl(sectionId: string) {
    return `/take-assessment-test/overview?view=subject&subject=${encodeURIComponent(sectionId)}`;
  }
}
