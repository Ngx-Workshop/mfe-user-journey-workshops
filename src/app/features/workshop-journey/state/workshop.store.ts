import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Subject,
  catchError,
  defer,
  finalize,
  switchMap,
  tap,
} from 'rxjs';
import { WorkshopApi } from '../api/workshop-api.service';
import {
  ProgressCatalog,
  SampleAnswer,
} from '../models/workshop.models';
import { workshopError } from '../utils/workshop-error';

@Injectable({ providedIn: 'root' })
export class WorkshopStore {
  private readonly api = inject(WorkshopApi);
  private readonly reads = new Subject<boolean>();
  private revision = 0;
  private readonly data = signal<ProgressCatalog | null>(null);
  private readonly pending = signal(false);
  private readonly fetching = signal(false);
  private readonly failure = signal('');
  private readonly sample = signal(false);
  readonly catalog = this.data.asReadonly();
  readonly busy = this.pending.asReadonly();
  readonly loading = this.fetching.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly example = this.sample.asReadonly();
  constructor() {
    this.reads
      .pipe(
        switchMap((example) => {
          const revision = ++this.revision;
          if (this.sample() !== example) this.data.set(null);
          this.sample.set(example);
          this.fetching.set(true);
          this.failure.set('');
          return this.api.catalog(example).pipe(
            tap((data) => {
              if (revision === this.revision) this.data.set(data);
            }),
            catchError((error) => {
              if (revision === this.revision)
                this.failure.set(workshopError(error));
              return EMPTY;
            }),
            finalize(() => {
              if (revision === this.revision)
                this.fetching.set(false);
            })
          );
        }),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe();
  }
  refresh(example = this.sample()) {
    if (!this.pending()) this.reads.next(example);
  }
  command(id: string, action: 'start') {
    return defer(() => {
      this.pending.set(true);
      this.failure.set('');
      ++this.revision;
      this.fetching.set(false);
      return this.api.command(this.sample(), id, action).pipe(
        tap((data) => this.data.set(data)),
        catchError((error) => {
          this.failure.set(workshopError(error));
          return EMPTY;
        }),
        finalize(() => this.pending.set(false))
      );
    });
  }
  assess(
    sectionId: string,
    answer: SampleAnswer,
    workshopAssessment = false
  ) {
    return defer(() => {
      this.pending.set(true);
      this.failure.set('');
      ++this.revision;
      this.fetching.set(false);
      return this.api
        .assess(this.sample(), sectionId, answer, workshopAssessment)
        .pipe(
          tap((result) => this.data.set(result.catalog)),
          catchError((error) => {
            this.failure.set(workshopError(error));
            return EMPTY;
          }),
          finalize(() => this.pending.set(false))
        );
    });
  }
  resetExample() {
    return defer(() => {
      this.pending.set(true);
      this.failure.set('');
      ++this.revision;
      this.fetching.set(false);
      return this.api.resetExample().pipe(
        tap((data) => this.data.set(data)),
        catchError((error) => {
          this.failure.set(workshopError(error));
          return EMPTY;
        }),
        finalize(() => this.pending.set(false))
      );
    });
  }
  seen(id: string, pageId: string) {
    return defer(() => {
      ++this.revision;
      this.fetching.set(false);
      return this.api.seen(this.sample(), id, pageId).pipe(
        tap((data) => {
          ++this.revision;
          this.data.set(data);
        })
      );
    });
  }
  page(id: string, pageId: string) {
    return this.api.page(this.sample(), id, pageId);
  }
}
