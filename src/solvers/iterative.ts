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
import { Street, Submission } from '../model';
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

  postMessage({
    max: dataset.duration,
    value: 0,
    info: {
      Iteration: 0,
      Score: highestScore,
    },
  } as WorkerMessageProgress);

  for (let i = 0; i < 1000; i++) {
    const queuedCarsCount = new Map(
      submission.schedules.flatMap((schedule) =>
        schedule.items.map((scheduleItem) => [scheduleItem.street, 0])
      )
    );

    submission.score = 0;
    const simulationState = initSimulation(dataset, submission);

    let start = Date.now();
    while (simulationState.second <= dataset.duration) {
      simulateStep(dataset, submission, simulationState);

      submission.schedules.forEach((schedule) =>
        schedule.items.forEach((scheduleItem) =>
          queuedCarsCount.set(
            scheduleItem.street,
            queuedCarsCount.get(scheduleItem.street)! +
              simulationState.lightQueues.get(scheduleItem.street)!.length
          )
        )
      );

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

    const [worstStreet] = [...queuedCarsCount.entries()].reduce(
      ([worstStreet, highestCarsCount], [street, carsCount]) =>
        carsCount > highestCarsCount
          ? [street, carsCount]
          : [worstStreet, highestCarsCount],
      [null! as Street, -Infinity]
    );

    submission.schedules.find((schedule) =>
      schedule.items.find((scheduleItem) => {
        if (scheduleItem.street === worstStreet) {
          scheduleItem.duration++;
          return true;
        }
      })
    );
  }
  postMessage('done');
};
