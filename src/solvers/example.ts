import { fetchDataset } from '../dataset';
import {
  WorkerMessageStartSolver,
  WorkerMessageSubmission,
} from '../helpers/worker';
import { Submission } from '../model';
import { initSimulation, simulateStep } from '../simulation';
import { formatSubmission } from '../submission';

onmessage = async (ev: MessageEvent<WorkerMessageStartSolver>) => {
  const dataset = await fetchDataset(ev.data.datasetName, ev.data.datasetUrl);
  const { intersections, streets } = dataset;
  const submission: Submission = {
    schedules: [
      {
        intersection: intersections[1],
        items: [
          { street: streets[2], duration: 2 },
          { street: streets[1], duration: 1 },
        ],
      },
      {
        intersection: intersections[0],
        items: [{ street: streets[0], duration: 2 }],
      },
      {
        intersection: intersections[2],
        items: [{ street: streets[4], duration: 1 }],
      },
    ],
    score: 0,
  };
  const simulationState = initSimulation(dataset, submission);
  while (simulationState.second < dataset.duration) {
    simulateStep(dataset, submission, simulationState);
  }
  const submissionMessage: WorkerMessageSubmission = {
    score: submission.score,
    textContent: formatSubmission(submission),
  };
  postMessage(submissionMessage);
  postMessage('done');
};
