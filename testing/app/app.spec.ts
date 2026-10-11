import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
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
      '/take-assessment-test/overview?view=subject&subject=angular&returnTo=%2Fworkshops%2Foverview'
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
    button('Try local example').click();
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
});
