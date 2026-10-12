import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { WorkshopJourneyComponent } from '../../src/app/features/workshop-journey/pages/journey/workshop-journey.component';
const importedJourney = By.directive(WorkshopJourneyComponent);
import { App } from '../../src/app/app';
import { catalog, workshop } from '../fixtures/workshop-catalog';

const base = '/api/user-metadata/workshop-progress';
describe('Workshop journey', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function render() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }
  it('shows the initial assessment and hides workshop actions before placement', () => {
    const fixture = render();
    http.expectOne(base).flush(catalog(false));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain(
      'Your workshops'
    );
    expect(element.textContent).not.toContain('First component');
    expect(element.querySelector('a')?.getAttribute('href')).toBe(
      '/take-assessment-test/subjects/angular?returnTo=%2Fworkshops%2Foverview'
    );
    expect(element.textContent).toContain('Take initial assessment');
  });
  it('records a displayed lesson and retries a failed progress save without manual completion', async () => {
    const fixture = render();
    http.expectOne(base).flush(catalog());
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (label: string) =>
      Array.from(element.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(label)
      )!;
    button('Start workshop').click();
    const started = {
      ...catalog(),
      sections: [
        {
          ...catalog().sections[0],
          workshops: [{ ...workshop, status: 'in-progress' }],
        },
      ],
    };
    http.expectOne(`${base}/workshops/w1/start`).flush(started);
    http
      .expectOne(`${base}/workshops/w1/pages/page1`)
      .flush({
        name: 'Getting started',
        html: JSON.stringify([
          {
            blockId: 'lesson',
            sortIndex: 0,
            componentInstanceName: 'HeaderBlockComponent',
            dataClean: 'Lesson content',
            savedAction: 'h2',
          },
        ]),
      });
    fixture.detectChanges();
    http
      .expectOne(`${base}/workshops/w1/pages/page1/seen`)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    await new Promise((resolve) => setTimeout(resolve, 30));
    fixture.detectChanges();
    expect(
      element.querySelector('ngx-editor-js2')?.textContent
    ).toContain('Lesson content');
    expect(
      element.querySelector('input[type="checkbox"]')
    ).toBeNull();
    expect(element.textContent).not.toContain(
      'I have completed this workshop'
    );
    expect(element.textContent).toContain('0 / 1 pages seen');
    button('Retry saving progress').click();
    const completed = {
      ...started,
      sections: [
        {
          ...started.sections[0],
          completedCount: 1,
          workshops: [
            {
              ...workshop,
              status: 'completed',
              viewedPageIds: ['page1'],
            },
          ],
        },
      ],
    };
    http
      .expectOne(`${base}/workshops/w1/pages/page1/seen`)
      .flush(completed);
    fixture.detectChanges();
    expect(element.textContent).toContain('1 / 1 pages seen');
    expect(element.textContent).toContain('Workshop complete.');
    http.expectNone(`${base}/workshops/w1/complete`);
  });
  it('does not count a failed or malformed page response as seen', () => {
    const fixture = render();
    http.expectOne(base).flush(catalog());
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Start workshop'))!
      .click();
    http.expectOne(`${base}/workshops/w1/start`).flush(catalog());
    http
      .expectOne(`${base}/workshops/w1/pages/page1`)
      .flush({ name: 'Broken', html: '[broken' });
    fixture.detectChanges();
    expect(element.querySelector('ngx-editor-js2')).toBeNull();
    expect(element.textContent).toContain('Retry lesson');
    http.expectNone(`${base}/workshops/w1/pages/page1/seen`);
  });
  it('preserves a sample assessment answer after a failed submission and permits retry', () => {
    const fixture = render();
    http.expectOne(base).flush(catalog(false));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (label: string) =>
      Array.from(element.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(label)
      )!;
    const journey = fixture.debugElement.query(importedJourney);
    journey.componentInstance.vm.changeMode(true);
    const sampleBase =
      'http://localhost:3004/user-metadata/workshop-progress';
    http
      .expectOne(sampleBase)
      .flush({ ...catalog(false), demo: true });
    fixture.detectChanges();
    button('Take initial assessment').click();
    fixture.detectChanges();
    expect(button('Submit assessment').disabled).toBeTrue();
    element
      .querySelector<HTMLInputElement>('input[value="component"]')!
      .click();
    fixture.detectChanges();
    expect(button('Submit assessment').disabled).toBeFalse();
    button('Submit assessment').click();
    http
      .expectOne(`${sampleBase}/example-assessments/angular`)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(
      element.querySelector<HTMLInputElement>(
        'input[value="component"]'
      )!.checked
    ).toBeTrue();
    button('Submit assessment').click();
    const submission = http.expectOne(
      `${sampleBase}/example-assessments/angular`
    );
    expect(submission.request.body).toEqual({ answer: 'component' });
    submission.flush({
      correct: true,
      catalog: { ...catalog(), demo: true },
    });
    fixture.detectChanges();
    expect(element.textContent).toContain('First component');
  });
  it('renders loading, error, retry and an empty catalog', () => {
    const fixture = render();
    expect(
      fixture.nativeElement.querySelector('mat-progress-bar')
    ).toBeTruthy();
    http
      .expectOne(base)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
    ).toBeTruthy();
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Retry loading'))!
      .click();
    http.expectOne(base).flush({ demo: false, sections: [] });
    fixture.detectChanges();
    expect(element.textContent).toContain(
      'No workshop sections have been added yet'
    );
  });
  it('organizes workshops by level and progress, filters the list, and retakes a completed workshop without erasing progress', () => {
    const fixture = render();
    const completed = { ...workshop, _id: 'completed', name: 'Finished foundations', status: 'completed' as const, viewedPageIds: ['page1'] };
    const progress = catalog();
    progress.sections[0] = { ...progress.sections[0], unlockedLevel: 2, totalCount: 4, completedCount: 1, lockedCount: 0, workshops: [
      { ...workshop, _id: 'later', name: 'Later level', level: 2 },
      { ...workshop, _id: 'ready', name: 'Ready workshop', sortId: 0 },
      completed,
      { ...workshop, _id: 'resume', name: 'Continue this workshop', status: 'in-progress', sortId: 1 },
    ] };
    http.expectOne(base).flush(progress); fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const titles = () => Array.from(element.querySelectorAll('.section__row h4')).map(h => h.textContent?.trim());
    expect(titles()).toEqual(['Continue this workshop', 'Ready workshop', 'Later level']);
    expect(element.textContent).not.toContain('Local preview options');
    expect(element.textContent).not.toContain('Try local example');
    const search = element.querySelector<HTMLInputElement>('input[type=search]')!;
    search.value = 'Ready workshop'; search.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(titles()).toEqual(['Ready workshop']);
    search.value = 'missing'; search.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(element.textContent).toContain('No matching workshops');
    Array.from(element.querySelectorAll('button')).find(b => b.textContent?.includes('Clear search'))!.click(); fixture.detectChanges();
    element.querySelectorAll<HTMLButtonElement>('.catalog__views button')[1].click(); fixture.detectChanges();
    expect(titles()).toEqual(['Finished foundations']);
    expect(element.textContent).toContain('Your completion and unlocked levels stay yours');
    Array.from(element.querySelectorAll('button')).find(b => b.textContent?.includes('Retake workshop'))!.click();
    http.expectOne(`${base}/workshops/completed/pages/page1`).flush({ name: 'Getting started', html: '[]' }); fixture.detectChanges();
    expect(element.querySelector('ngx-workshop-reader')?.textContent).toContain('Finished foundations');
    expect(element.textContent).toContain('Workshop complete.');
    expect(element.textContent).toContain('1 / 1 pages seen');
    http.expectNone(request => request.method === 'POST');
    Array.from(element.querySelectorAll('button')).find(b => b.textContent?.includes('Back to workshops'))!.click(); fixture.detectChanges();
    expect(titles()).toEqual(['Finished foundations']);
  });
  it('offers an empty completed list without hiding available workshops', () => {
    const fixture = render(); http.expectOne(base).flush(catalog()); fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelectorAll<HTMLButtonElement>('.catalog__views button')[1].click(); fixture.detectChanges();
    expect(element.textContent).toContain('Your completed workshops will appear here');
    element.querySelector<HTMLButtonElement>('.catalog__views button')!.click(); fixture.detectChanges();
    expect(element.textContent).toContain('First component');
  });

});
