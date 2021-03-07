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
  let highestScore = -1;

  postMessage({
    max: undefined as unknown,
    value: undefined as unknown,
    info: {
      Iteration: 0,
      Score: highestScore,
    },
  } as WorkerMessageProgress);

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

  for (let i = 0; i < 10; i++) {
    submission.score = 0;
    const simulationState = initSimulation(dataset, submission);

    postMessage({
      max: dataset.duration,
      value: simulationState.second,
      info: {
        Iteration: i,
        Score: highestScore,
      },
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
          info: {
            Iteration: i,
            Score: highestScore,
          },
        } as WorkerMessageProgress);
      }
    }

    if (submission.score > highestScore) {
      highestScore = submission.score;
      const submissionMessage: WorkerMessageSubmission = {
        score: submission.score,
        textContent: formatSubmission(submission),
      };
      postMessage(submissionMessage);
    }

    postMessage({
      max: dataset.duration,
      value: simulationState.second,
      info: {
        Iteration: i,
        Score: highestScore,
      },
    } as WorkerMessageProgress);
  }
  postMessage('done');
};
