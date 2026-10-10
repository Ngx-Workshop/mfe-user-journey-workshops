import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WorkshopJourneyComponent } from './features/workshop-journey/pages/journey/workshop-journey.component';

@Component({
  selector: 'mfe-user-journey-workshops',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WorkshopJourneyComponent],
  template: `<ngx-workshop-journey />`,
  styles: [':host { display: block; }'],
})
export class App {}
export default App;
