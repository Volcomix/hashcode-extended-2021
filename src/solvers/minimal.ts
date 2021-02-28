import { fetchDataset } from '../dataset';
import { WorkerMessageStartSolver } from '../helpers/worker';
import { Submission } from '../model';

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
  console.log(submission);
};
