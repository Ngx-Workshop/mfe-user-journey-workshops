import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  ProgressCatalog,
  Reading,
  SampleAnswer,
  SampleResult,
} from '../models/workshop.models';

@Injectable({ providedIn: 'root' })
export class WorkshopApi {
  private readonly http = inject(HttpClient);
  private base(example: boolean) {
    return example
      ? 'http://localhost:3004/user-metadata/workshop-progress'
      : '/api/user-metadata/workshop-progress';
  }
  catalog(example: boolean) {
    return this.http.get<ProgressCatalog>(this.base(example));
  }
  command(example: boolean, id: string, action: 'start') {
    return this.http.post<ProgressCatalog>(
      `${this.base(example)}/workshops/${encodeURIComponent(id)}/${action}`,
      {}
    );
  }
  resetExample() {
    return this.http.post<ProgressCatalog>(
      `${this.base(true)}/example-reset`,
      {}
    );
  }
  page(example: boolean, id: string, pageId: string) {
    return this.http.get<Reading>(
      `${this.base(example)}/workshops/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}`
    );
  }
  seen(example: boolean, id: string, pageId: string) {
    return this.http.post<ProgressCatalog>(
      `${this.base(example)}/workshops/${encodeURIComponent(id)}/pages/${encodeURIComponent(pageId)}/seen`,
      {}
    );
  }
  assess(
    example: boolean,
    sectionId: string,
    answer: SampleAnswer,
    workshopAssessment = false
  ) {
    return this.http.post<SampleResult>(
      `${this.base(example)}/${workshopAssessment ? 'example-workshop-assessments' : 'example-assessments'}/${encodeURIComponent(sectionId)}`,
      { answer }
    );
  }
}
