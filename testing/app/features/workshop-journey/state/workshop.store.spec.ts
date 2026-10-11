import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { WorkshopStore } from '../../../../../src/app/features/workshop-journey/state/workshop.store';
import { catalog } from '../../../../fixtures/workshop-catalog';
const base = '/api/user-metadata/workshop-progress';
describe('WorkshopStore', () => {
  let store: WorkshopStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(WorkshopStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('cancels stale refreshes and preserves successful state on failure', () => {
    store.refresh();
    const first = http.expectOne(base);
    store.refresh();
    expect(first.cancelled).toBeTrue();
    http.expectOne(base).flush(catalog());
    store.refresh();
    http
      .expectOne(base)
      .flush({}, { status: 503, statusText: 'Unavailable' });
    expect(store.catalog()?.sections[0].workshops.length).toBe(1);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeTruthy();
  });
  it('uses an explicit loopback endpoint for the local example and clears live state', () => {
    store.refresh();
    http.expectOne(base).flush(catalog());
    store.refresh(true);
    expect(store.catalog()).toBeNull();
    http
      .expectOne(
        'http://localhost:3004/user-metadata/workshop-progress'
      )
      .flush({ ...catalog(), demo: true });
    expect(store.example()).toBeTrue();
  });
  it('a completion response wins over an older catalog response', () => {
    store.refresh();
    const old = http.expectOne(base);
    store.seen('w1', 'page1').subscribe();
    const completed = {
      ...catalog(),
      sections: [{ ...catalog().sections[0], completedCount: 1 }],
    };
    http.expectOne(`${base}/workshops/w1/pages/page1/seen`).flush(completed);
    old.flush(catalog());
    expect(store.catalog()?.sections[0].completedCount).toBe(1);
    expect(store.busy()).toBeFalse();
  });
});
