import {
  fetchDataset,
  getCarsCountByIntersection,
  getCarsCountByStreet,
} from '../dataset';
import {
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
      .map((intersection) => {
        const streets = intersection.arrivals.filter(
          (street) => carsCountByStreet[street.id]
        );
        const sum = streets.reduce(
          (acc, street) => acc + carsCountByStreet[street.id],
          0
        );
        const minCarsCount = Math.min(
          ...streets.map((street) => carsCountByStreet[street.id])
        );
        const factor = sum / minCarsCount;
        return {
          intersection,
          items: streets.map((street) => ({
            street,
            duration: Math.round((factor * carsCountByStreet[street.id]) / sum),
          })),
        };
      }),
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
