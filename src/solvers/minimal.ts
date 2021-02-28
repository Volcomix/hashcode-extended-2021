import { fetchDataset } from '../dataset';
import { WorkerMessageStartSolver } from '../helpers/worker';

onmessage = async (ev: MessageEvent<WorkerMessageStartSolver>) => {
  const dataset = await fetchDataset(ev.data.datasetName, ev.data.datasetUrl);
  console.log(dataset);
};
