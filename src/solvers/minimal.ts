import {
  fetchDataset,
  getCarsCountByIntersection,
  getCarsCountByStreet,
} from '../dataset';
import {
  WorkerMessageProgress,
  WorkerMessageStartSolver,
  WorkerMessageSubmission,
} from '../helpers/worker';
import { Submission } from '../model';
import { initSimulation, simulateStep } from '../simulation';
import { formatSubmission } from '../submission';

onmessage = async (ev: MessageEvent<WorkerMessageStartSolver>) => {
  const dataset = await fetchDataset(ev.data.datasetName, ev.data.datasetUrl);
  const carsCountByStreet = getCarsCountByStreet(dataset);
  const carsCountByIntersection = getCarsCountByIntersection(dataset);
  const submission: Submission = {
    schedules: dataset.intersections
      .filter((intersection) => carsCountByIntersection[intersection.id])
      .map((intersection) => ({
        intersection,
        items: intersection.arrivals
          .filter((street) => carsCountByStreet[street.id])
          .map((street) => ({
            street,
            duration: 1,
          })),
      })),
    score: 0,
  };
  const simulationState = initSimulation(dataset, submission);
  postMessage({
    max: dataset.duration,
    value: simulationState.second,
  } as WorkerMessageProgress);
  let start = Date.now();
  while (simulationState.second <= dataset.duration) {
    simulateStep(dataset, submission, simulationState);
    const end = Date.now();
    const elapsed = end - start;
    if (elapsed >= 1000) {
      start = end;
      postMessage({
        max: dataset.duration,
        value: simulationState.second,
      } as WorkerMessageProgress);
    }
  }
  const submissionMessage: WorkerMessageSubmission = {
    score: submission.score,
    textContent: formatSubmission(submission),
  };
  postMessage(submissionMessage);
};
