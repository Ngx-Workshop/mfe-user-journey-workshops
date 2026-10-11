import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  untracked,
  inject,
  signal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly document = inject(DOCUMENT);
  private requestedWorkshop: string | null = null;
  private requestedPage: string | null = null;
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
  readonly overviewView = signal<'active' | 'completed'>('active');
  readonly search = signal('');
  readonly assessmentLinks = computed(() => Object.fromEntries(this.sections().map(s => [s.sectionId, this.assessmentUrl(s.sectionId)])));
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
    const search = this.document.location?.search ?? '';
    const restore = (params: URLSearchParams | import('@angular/router').ParamMap) => {
      this.requestedWorkshop = params.get('workshop');
      this.requestedPage = params.get('page');
      if (!this.requestedWorkshop && this.selectedId()) this.close(false);
      this.restoreSelection();
    };
    if (this.route) this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(restore);
    else restore(new URLSearchParams(search));
    effect(() => {
      this.catalog();
      untracked(() => this.restoreSelection());
    });
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
  retake(workshop: Workshop) {
    if (!this.busy() && !this.loading() && workshop.status === 'completed') this.open(workshop._id);
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
    const resume = this.selected()?.workshopDocuments.slice().sort((a, b) => a.sortId - b.sortId).find(p => p.kind === 'PAGE' && !this.selected()?.viewedPageIds.includes(p._id));
    if (resume || first) this.read((resume ?? first)!._id);
    else {
      this.pageId.set('');
      this.pages.next(null);
      this.updateSelection(id, null);
    }
  }
  close(updateUrl = true) {
    this.assessmentSection.set(null);
    this.visitError.set('');
    this.selectedId.set(null);
    this.pageId.set('');
    this.pages.next(null);
    if (updateUrl) this.updateSelection(null, null);
  }
  read(pageId: string) {
    const id = this.selectedId();
    if (id) {
      this.visitError.set('');
      this.pageId.set(pageId);
      this.pages.next({ id, pageId });
      this.updateSelection(id, pageId);
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
  private restoreSelection() {
    if (!this.requestedWorkshop || !this.catalog()) return;
    const workshop = this.catalog()?.sections.flatMap(s => s.workshops).find(w => w._id === this.requestedWorkshop);
    if (!workshop) {
      this.close(false);
      this.message.set('This workshop is unavailable. Choose an available workshop to continue.');
      return;
    }
    const page = workshop.workshopDocuments.find(p => p.kind === 'PAGE' && p._id === this.requestedPage)
      ?? workshop.workshopDocuments.slice().sort((a, b) => a.sortId - b.sortId).find(p => p.kind === 'PAGE');
    if (this.selectedId() === workshop._id && this.pageId() === (page?._id ?? '')) return;
    this.selectedId.set(workshop._id);
    if (page) this.read(page._id);
    else { this.pageId.set(''); this.pages.next(null); }
  }
  private updateSelection(workshop: string | null, page: string | null) {
    this.requestedWorkshop = workshop;
    this.requestedPage = page;
    if (this.router) void this.router.navigate([], {
      relativeTo: this.route ?? undefined, queryParams: { workshop, page }, queryParamsHandling: 'merge',
    });
  }
  activity({ url, event }: { url: string; event: MouseEvent }) {
    if (this.router && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      if (!this.busy()) void this.router.navigateByUrl(url);
    }
  }
  assessmentUrl(sectionId: string, test?: string) {
    const params = new URLSearchParams({ view: 'subject', subject: sectionId });
    if (test) { params.set('test', test); params.set('launch', 'direct'); }
    return this.activityUrl('/take-assessment-test/overview', params);
  }
  labUrl(lab: string) {
    const params = new URLSearchParams({ lab });
    if (lab) params.set('launch', 'direct');
    return this.activityUrl('/coding-labs/explore', params);
  }
  private activityUrl(path: string, params: URLSearchParams) {
    const workshop = this.selected();
    const selection = new URLSearchParams();
    if (workshop) {
      selection.set('workshop', workshop._id);
      if (this.pageId()) selection.set('page', this.pageId());
      params.set('workshopName', workshop.name);
    }
    params.set('returnTo', '/workshops/overview' + (selection.size ? '?' + selection.toString() : ''));
    return path + '?' + params.toString();
  }
}
