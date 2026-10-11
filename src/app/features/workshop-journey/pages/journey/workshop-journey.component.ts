import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ElementRef, Injector, afterNextRender, effect, viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
  ],
  providers: [JourneyViewModel],
  template: `
    @if (!vm.selected()) { <ngx-workshop-hero /> }
    <nav class="journey__nav" aria-label="Workshop views"><span>Workshops</span><button mat-button (click)="vm.refresh()" [disabled]="vm.busy() || vm.loading()">Refresh progress</button></nav>
    <main #content tabindex="-1" class="journey" [attr.aria-busy]="vm.loading() || vm.busy()">
      <details class="journey__example"><summary>{{ vm.example() ? 'Local example active · Preview options' : 'Local preview options' }}</summary><div class="journey__mode">
        <button
          mat-button
          (click)="vm.changeMode(!vm.example())"
          [disabled]="vm.busy() || vm.loading()"
        >
          {{
            vm.example()
              ? 'Use my live progress'
              : 'Try local example'
          }}
        </button>
        @if (vm.example()) {
          <p>
            Local example · synthetic learner · progress saved in the
            isolated local database.
          </p>
          <button
            mat-button
            (click)="vm.resetExample()"
            [disabled]="vm.busy() || vm.loading()"
          >
            Reset local example
          </button>
        }
      </div>
      </details>
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
        @for (section of vm.sections(); track section.sectionId) {
          <section
            class="journey__section"
            [attr.aria-label]="section.title"
          >
            <h2>{{ section.title }}</h2>
            <p>{{ section.description }}</p>
            @if (!section.assessmentCompleted) {
              <p>
                Complete your initial assessment to unlock workshops
                in this section.
              </p>
              @if (vm.example()) {
                <button
                  mat-flat-button
                  (click)="vm.beginAssessment(section.sectionId)"
                  [disabled]="vm.busy()"
                >
                  Take initial assessment
                </button>
              } @else if (section.assessmentAvailable) {
                <a
                  mat-flat-button
                  [href]="vm.assessmentUrl(section.sectionId)"
                  (click)="vm.activity({ url: vm.assessmentUrl(section.sectionId), event: $event })"
                  >Take initial assessment</a
                >
                <p>
                  Use Return to workshop after your assessment to
                  see your updated progress.
                </p>
              } @else {
                <p>
                  No initial assessment is available yet. Please check
                  back when one has been added.
                </p>
              }
            } @else {
              <p class="journey__progress">
                Level {{ section.unlockedLevel }} unlocked ·
                {{ section.completedCount }} /
                {{ section.totalCount }} workshops completed
              </p>
              <p>
                Complete every workshop at a level to unlock the next
                level.
              </p>
              <div class="journey__workshops">
                @for (
                  workshop of section.workshops;
                  track workshop._id
                ) {
                  @if (workshop.status !== 'completed') {
                    <article class="journey__workshop">
                      <p class="journey__level">
                        Level {{ workshop.level }}
                      </p>
                      <h3>{{ workshop.name }}</h3>
                      <p>{{ workshop.summary }}</p>
                      <p>
                        {{ workshop.viewedPageIds.length }} /
                        {{ workshop.pageCount }} pages seen ·
                        {{
                          workshop.assessmentsCompleted
                            ? 'Assessments completed'
                            : 'Assessment pending'
                        }}
                      </p>
                      <button
                        mat-flat-button
                        (click)="vm.start(workshop)"
                        [disabled]="vm.busy() || vm.loading()"
                      >
                        {{
                          workshop.status === 'in-progress'
                            ? 'Resume workshop'
                            : 'Start workshop'
                        }}
                      </button>
                    </article>
                  }
                }
              </div>
              @if (
                section.completedCount === section.totalCount &&
                section.totalCount > 0
              ) {
                <p>All workshops in this section are complete.</p>
              }
              @if (section.totalCount === 0) {
                <p>
                  No workshops have been added to this section yet.
                </p>
              }
              @if (section.lockedCount > 0) {
                <p>
                  {{ section.lockedCount }} workshops will become
                  available as you progress.
                </p>
              }
              @if (section.completedCount > 0) {
                <details class="journey__completed">
                  <summary>
                    Completed workshops ({{ section.completedCount }})
                  </summary>
                  <ul>
                    @for (
                      workshop of section.workshops;
                      track workshop._id
                    ) {
                      @if (workshop.status === 'completed') {
                        <li>
                          {{ workshop.name }} · Level
                          {{ workshop.level }}
                        </li>
                      }
                    }
                  </ul>
                </details>
              }
            }
          </section>
        } @empty {
          @if (!vm.loading() && !vm.error()) {
            <p>No workshop sections have been added yet.</p>
          }
        }
      }
    </main><footer class="journey__footer"><span>Small steps. Lasting understanding.</span><span>NGX WORKSHOP ✦</span></footer>
  `,
  styles: [
    `
      :host {
        display: block; min-width: 0; width: 100%; font-family: 'Roboto', sans-serif;
        color: var(--ink); --ink: var(--mat-sys-on-surface); --muted: var(--mat-sys-on-surface-variant);
        --panel: var(--mat-sys-surface-container-lowest); --soft: var(--mat-sys-surface-container);
        --line: var(--mat-sys-outline-variant); --accent: var(--mat-sys-primary);
        --primary-soft: var(--mat-sys-primary-container); --on-primary-soft: var(--mat-sys-on-primary-container);
      }
      * { box-sizing: border-box; }
      .journey { max-width: 1340px; margin: auto; padding: 38px clamp(22px, 5vw, 65px) 50px; }
      .journey:focus { outline: none; }
      .journey__nav { display: flex; justify-content: space-between; align-items: center; padding: 12px clamp(22px, 5vw, 65px); border-bottom: 1px solid var(--line); background: var(--panel); color: var(--accent); font-size: 13px; }
      .journey__example { margin-bottom: 24px; color: var(--muted); font-size: 12px; }
      summary { cursor: pointer; }
      .journey__footer { border-top: 1px solid var(--line); margin: 0 clamp(22px, 5vw, 65px); padding: 22px 0; display: flex; justify-content: space-between; gap: 18px; color: var(--muted); font-size: 10px; }
      h2 { font-size: 25px; margin: 0 0 12px; }
      h3 { font-size: 22px; }
      p { line-height: 1.7; }
      button:focus-visible, a:focus-visible, summary:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
      .journey__header,
      .journey__mode {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .journey__section {
        padding: clamp(20px, 3vw, 28px);
        margin-block: 24px;
        background: var(--panel);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 1rem;
      }
      .journey__workshops {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(min(100%, 17rem), 1fr)
        );
        gap: 1rem;
      }
      .journey__workshop {
        padding: 24px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--mat-sys-surface-container);
      }
      .journey__level,
      .journey__progress {
        color: var(--mat-sys-primary);
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
      .journey__completed {
        margin-top: 1rem;
      }
    `,
  ],
})
export class WorkshopJourneyComponent {
  readonly vm = inject(JourneyViewModel);
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  constructor() {
    const injector = inject(Injector);
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    effect(() => {
      const id = this.vm.selectedId();
      const page = this.vm.pageId();
      afterNextRender(() => {
        if (id !== this.vm.selectedId() || page !== this.vm.pageId()) return;
        this.content()?.nativeElement.focus({ preventScroll: true });
        (id ? this.content()?.nativeElement : host.nativeElement)?.scrollIntoView({ block: 'start' });
      }, { injector });
    });
  }
}
