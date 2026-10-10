import { Route } from '@angular/router';
import App from './app';

export const Routes: Route[] = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'overview',
    component: App,
  },
];
