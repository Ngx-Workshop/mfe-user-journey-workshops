import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WorkshopCatalogComponent } from '../../components/workshop-catalog.component';
import { WorkshopHeroComponent } from '../../components/workshop-hero.component';
import { JourneyViewModel } from './journey.view-model';
import { WorkshopReaderComponent } from '../../components/workshop-reader.component';

@Component({
  selector: 'ngx-workshop-journey',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressBarModule,
    WorkshopReaderComponent,
    WorkshopHeroComponent,
    WorkshopCatalogComponent,
  ],
  providers: [JourneyViewModel],
  template: `
    @if (!vm.selected()) {
      <ngx-workshop-hero />
    }
    <nav class="journey__nav" aria-label="Workshop views">
      <span>Workshops</span
      ><button
        mat-button
        (click)="vm.refresh()"
        [disabled]="vm.busy() || vm.loading()"
      >
        Refresh progress
      </button>
    </nav>
    <main
      #content
      tabindex="-1"
      class="journey"
      [attr.aria-busy]="vm.loading() || vm.busy()"
    >
      @if (vm.loading()) {
        <mat-progress-bar
          mode="indeterminate"
          aria-label="Loading workshops"
        />
      }
      @if (vm.error()) {
        <div class="journey__error" role="alert">
          <p>{{ vm.error() }}</p>
          <button
            mat-button
            (click)="vm.refresh()"
            [disabled]="vm.busy()"
          >
            Retry loading
          </button>
        </div>
      }
      @if (vm.message()) {
        <p class="journey__message" role="status">
          {{ vm.message() }}
        </p>
      }
      @if (vm.assessmentSection()) {
        <form
          class="journey__assessment"
          (submit)="$event.preventDefault(); vm.submitAssessment()"
        >
          <fieldset [disabled]="vm.busy()">
            <legend>
              Which Angular building block combines a template and
              behavior?
            </legend>
            <label
              ><input
                type="radio"
                name="answer"
                value="component"
                [formControl]="vm.answer"
              />
              A component</label
            >
            <label
              ><input
                type="radio"
                name="answer"
                value="database"
                [formControl]="vm.answer"
              />
              A database index</label
            >
          </fieldset>
          <button
            mat-flat-button
            type="submit"
            [disabled]="!vm.answer.value || vm.busy()"
          >
            Submit assessment
          </button>
        </form>
      }
      @if (vm.selected(); as workshop) {
        <ngx-workshop-reader
          [workshop]="workshop"
          [pageId]="vm.pageId()"
          [blocks]="vm.blocks()"
          [loading]="vm.pageLoading()"
          [error]="vm.pageError()"
          [busy]="vm.busy()"
          [assessmentUrl]="vm.assessmentUrl(workshop.sectionId)"
          [labUrl]="vm.labUrl('')"
          (read)="vm.read($event)"
          [example]="vm.example()"
          [visitError]="vm.visitError()"
          [visitPending]="vm.visitPending()"
          (seen)="vm.seen($event)"
          (assess)="vm.beginWorkshopAssessment($event)"
          (activity)="vm.activity($event)"
          (exit)="vm.close()"
        />
      } @else {
        @if (vm.sections().length || (!vm.loading() && !vm.error())) {
          <ngx-workshop-catalog
            [sections]="vm.sections()"
            [assessmentLinks]="vm.assessmentLinks()"
            [view]="vm.overviewView()"
            [query]="vm.search()"
            [busy]="vm.busy() || vm.loading()"
            [example]="vm.example()"
            (viewChange)="vm.overviewView.set($event)"
            (queryChange)="vm.search.set($event)"
            (start)="vm.start($event)"
            (retake)="vm.retake($event)"
            (assess)="vm.beginAssessment($event)"
            (activity)="vm.activity($event)"
          />
        }
      }
    </main>
    <footer class="journey__footer">
      <span>Small steps. Lasting understanding.</span
      ><span>NGX WORKSHOP ✦</span>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        width: 100%;
        font-family: 'Roboto', sans-serif;
        color: var(--ink);
        --ink: var(--mat-sys-on-surface);
        --muted: var(--mat-sys-on-surface-variant);
        --panel: var(--mat-sys-surface-container-lowest);
        --soft: var(--mat-sys-surface-container);
        --line: var(--mat-sys-outline-variant);
        --accent: var(--mat-sys-primary);
        --primary-soft: var(--mat-sys-primary-container);
        --on-primary-soft: var(--mat-sys-on-primary-container);
      }
      * {
        box-sizing: border-box;
      }
      .journey {
        max-width: 1340px;
        margin: auto;
        padding: 38px clamp(22px, 5vw, 65px) 50px;
      }
      .journey:focus {
        outline: none;
      }
      .journey__nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px clamp(22px, 5vw, 65px);
        border-bottom: 1px solid var(--line);
        background: var(--panel);
        color: var(--accent);
        font-size: 13px;
      }
      .journey__footer {
        border-top: 1px solid var(--line);
        margin: 0 clamp(22px, 5vw, 65px);
        padding: 22px 0;
        display: flex;
        justify-content: space-between;
        gap: 18px;
        color: var(--muted);
        font-size: 10px;
      }
      .journey__error {
        padding: 1rem;
        color: var(--mat-sys-error);
      }
      .journey__message {
        padding: 1rem;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      .journey__assessment {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
        justify-items: start;
      }
      .journey__assessment fieldset {
        display: grid;
        gap: 0.75rem;
      }
    `,
  ],
})
export class WorkshopJourneyComponent {
  readonly vm = inject(JourneyViewModel);
  private readonly content =
    viewChild<ElementRef<HTMLElement>>('content');
  constructor() {
    const injector = inject(Injector);
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    effect(() => {
      const id = this.vm.selectedId();
      const page = this.vm.pageId();
      afterNextRender(
        () => {
          if (
            id !== this.vm.selectedId() ||
            page !== this.vm.pageId()
          )
            return;
          this.content()?.nativeElement.focus({
            preventScroll: true,
          });
          (id
            ? this.content()?.nativeElement
            : host.nativeElement
          )?.scrollIntoView({ block: 'start' });
        },
        { injector }
      );
    });
  }
}
