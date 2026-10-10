import { HttpErrorResponse } from '@angular/common/http';

export function workshopError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401)
      return 'Sign in to see your workshop progress.';
    if (error.status === 403)
      return 'This workshop is locked. Refresh your progress and complete the section prerequisites.';
    if (error.status === 0)
      return 'Could not reach the workshop service. For the local example, start the example service on port 3004.';
    if (error.status === 404)
      return 'The workshop progress API is unavailable. You can try the local example while the service is being connected.';
  }
  return 'Could not load or save your workshop progress. Please retry.';
}
