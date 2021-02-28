import { fetchDataset } from '../dataset';
import {
  WorkerMessageStartSolver,
  WorkerMessageSubmission,
} from '../helpers/worker';
import { Submission } from '../model';
import { formatSubmission } from '../submission';

onmessage = async (ev: MessageEvent<WorkerMessageStartSolver>) => {
  const dataset = await fetchDataset(ev.data.datasetName, ev.data.datasetUrl);
  const submission: Submission = {
    schedules: dataset.intersections.map((intersection) => ({
      intersection,
      items: intersection.arrivals.map((street) => ({
        street,
        duration: 1,
      })),
    })),
    score: 0,
  };
  const submissionMessage: WorkerMessageSubmission = {
    score: submission.score,
    textContent: formatSubmission(submission),
  };
  postMessage(submissionMessage);
};
