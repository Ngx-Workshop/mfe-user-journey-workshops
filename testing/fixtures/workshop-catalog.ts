import {
  ProgressCatalog,
  Workshop,
} from '../../src/app/features/workshop-journey/models/workshop.models';
export const workshop: Workshop = {
  _id: 'w1',
  sectionId: 'angular',
  name: 'First component',
  summary: 'Create a component',
  level: 1,
  sortId: 0,
  status: 'available',
  workshopDocuments: [
    {
      _id: 'page1',
      kind: 'PAGE',
      name: 'Getting started',
      sortId: 0,
    },
  ],
};
export function catalog(assessed = true): ProgressCatalog {
  return {
    demo: false,
    sections: [
      {
        sectionId: 'angular',
        title: 'Angular',
        description: 'Learn Angular',
        assessmentCompleted: assessed,
        assessmentAvailable: true,
        unlockedLevel: assessed ? 1 : 0,
        totalCount: 2,
        completedCount: 0,
        lockedCount: assessed ? 1 : 2,
        workshops: assessed ? [workshop] : [],
      },
    ],
  };
}
