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
      '/take-assessment-test/overview?view=subject&subject=angular'
    );
    expect(element.textContent).toContain('Take initial assessment');
  });
  it('starts and reads an eligible workshop, retaining the reader if completion fails', async () => {
    const fixture = render();
    http.expectOne(base).flush(catalog());
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const start = Array.from(element.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Start workshop')
    )!;
    start.click();
    http
      .expectOne(`${base}/workshops/w1/start`)
      .flush({
        ...catalog(),
        sections: [
          {
            ...catalog().sections[0],
            workshops: [{ ...workshop, status: 'in-progress' }],
          },
        ],
      });
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
    await new Promise((resolve) => setTimeout(resolve, 30));
    fixture.detectChanges();
    expect(
      element.querySelector('ngx-editor-js2')?.textContent
    ).toContain('Lesson content');
    const complete = Array.from(
      element.querySelectorAll('button')
    ).find((b) => b.textContent?.includes('Complete workshop'))!;
    expect(complete.disabled).toBeTrue();
    element
      .querySelector<HTMLInputElement>('input[type="checkbox"]')!
      .click();
    fixture.detectChanges();
    complete.click();
    http
      .expectOne(`${base}/workshops/w1/complete`)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(element.querySelector('ngx-workshop-reader')).toBeTruthy();
    expect(
      element.querySelector<HTMLInputElement>(
        'input[type="checkbox"]'
      )!.checked
    ).toBeTrue();
    expect(element.querySelector('[role="alert"]')).toBeTruthy();
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
