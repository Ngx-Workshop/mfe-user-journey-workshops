import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
  ],
  providers: [JourneyViewModel],
  template: `
    <main class="journey">
      <header class="journey__header">
        <div>
          <h1>Your workshops</h1>
          <p>
            Assess your starting point, complete workshops, and unlock
            the next level.
          </p>
        </div>
        <button
          mat-button
          (click)="vm.refresh()"
          [disabled]="vm.busy() || vm.loading()"
        >
          Refresh progress
        </button>
      </header>
      <div class="journey__mode">
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
      @if (vm.selected(); as workshop) {
        <ngx-workshop-reader
          [workshop]="workshop"
          [pageId]="vm.pageId()"
          [blocks]="vm.blocks()"
          [loading]="vm.pageLoading()"
          [error]="vm.pageError()"
          [busy]="vm.busy()"
          [assessmentUrl]="vm.assessmentUrl(workshop.sectionId)"
          (read)="vm.read($event)"
          (finish)="vm.complete()"
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
                  >Take initial assessment</a
                >
                <p>
                  After submitting your assessment, return here and
                  refresh progress.
                </p>
              } @else {
                <p>
                  No initial assessment is available yet. Please check
                  back when one has been added.
                </p>
              }
              @if (vm.assessmentSection() === section.sectionId) {
                <form
                  class="journey__assessment"
                  (submit)="
                    $event.preventDefault(); vm.submitAssessment()
                  "
                >
                  <fieldset [disabled]="vm.busy()">
                    <legend>
                      Which Angular building block combines a template
                      and behavior?
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
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--mat-sys-on-surface);
      }
      .journey {
        max-width: 72rem;
        margin: auto;
        padding: clamp(1rem, 3vw, 2.5rem);
      }
      .journey__header,
      .journey__mode {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .journey__section {
        padding: 1.5rem;
        margin-block: 1.5rem;
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
        padding: 1rem;
        border-radius: 0.75rem;
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
}
