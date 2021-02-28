import { Schedule, Submission } from './model';

export function formatSubmission(submission: Submission): string {
  return [
    `${submission.schedules.length}`,
    ...submission.schedules.flatMap(formatSchedule),
  ].join('\n');
}

function formatSchedule({ intersection, items }: Schedule): string[] {
  return [
    `${intersection.id}`,
    `${items.length}`,
    ...items.map(({ street, duration }) => `${street.name} ${duration}`),
  ];
}
