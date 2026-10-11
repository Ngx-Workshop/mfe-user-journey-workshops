import { HttpErrorResponse } from '@angular/common/http';

export function workshopError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401)
      return 'Sign in to see your workshop progress.';
    if (error.status === 403)
      return 'This workshop is locked. Refresh your progress and complete the section prerequisites.';
    if (error.status === 0)
      return 'Could not reach your workshops. Check your connection and try again.';
    if (error.status === 404)
      return 'These workshops are temporarily unavailable. Please try again later.';
  }
  return 'Could not load or save your workshop progress. Please retry.';
}
