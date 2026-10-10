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
  command(
    example: boolean,
    id: string,
    action: 'start' | 'complete'
  ) {
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
  assess(example: boolean, sectionId: string, answer: SampleAnswer) {
    return this.http.post<SampleResult>(
      `${this.base(example)}/example-assessments/${encodeURIComponent(sectionId)}`,
      { answer }
    );
  }
}
