import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { JourneyViewModel } from '../../../../../../src/app/features/workshop-journey/pages/journey/journey.view-model';
import { catalog, workshop } from '../../../../../fixtures/workshop-catalog';

describe('Workshop activity continuity', () => {
  it('restores a returned lesson from server progress without starting another workshop', () => {
    const params = new BehaviorSubject(convertToParamMap({ workshop: 'w1', page: 'page2' }));
    const router = { navigate: jasmine.createSpy('navigate').and.resolveTo(true), navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
    TestBed.configureTestingModule({ providers: [JourneyViewModel, provideHttpClient(), provideHttpClientTesting(),
      { provide: Router, useValue: router }, { provide: ActivatedRoute, useValue: { queryParamMap: params } }] });
    const http = TestBed.inject(HttpTestingController);
    const vm = TestBed.inject(JourneyViewModel);
    const progress = catalog();
    progress.sections[0].workshops = [{ ...workshop, viewedPageIds: ['page1'], workshopDocuments: [...workshop.workshopDocuments, { _id: 'page2', name: 'Next lesson', kind: 'PAGE', sortId: 1 }] }];
    http.expectOne('/api/user-metadata/workshop-progress').flush(progress);
    TestBed.tick();
    http.expectOne('/api/user-metadata/workshop-progress/workshops/w1/pages/page2').flush({ name: 'Next lesson', html: '' });
    expect(vm.selectedId()).toBe('w1'); expect(vm.pageId()).toBe('page2');
    const assessment = new URL(vm.assessmentUrl('angular', 'test/one'), 'https://example.test');
    expect(assessment.searchParams.get('test')).toBe('test/one');
    expect(assessment.searchParams.get('returnTo')).toBe('/workshops/overview?workshop=w1&page=page2');
    const lab = new URL(vm.labUrl('lab/one'), 'https://example.test');
    expect(lab.searchParams.get('lab')).toBe('lab/one'); expect(lab.searchParams.get('workshopName')).toBe(workshop.name);
    const click = new MouseEvent('click', { cancelable: true });
    vm.activity({ url: lab.pathname + lab.search, event: click });
    expect(click.defaultPrevented).toBeTrue(); expect(router.navigateByUrl).toHaveBeenCalled();
    const modifiedClick = new MouseEvent('click', { cancelable: true, ctrlKey: true });
    vm.activity({ url: lab.pathname + lab.search, event: modifiedClick });
    expect(modifiedClick.defaultPrevented).toBeFalse(); expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    params.next(convertToParamMap({ workshop: 'unavailable' }));
    expect(vm.selectedId()).toBeNull(); expect(vm.message()).toContain('unavailable');
    params.next(convertToParamMap({})); expect(vm.selectedId()).toBeNull();
    http.verify();
  });
});
