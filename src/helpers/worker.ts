export type WorkerMessageStartSolver = {
  datasetName: string;
  datasetUrl: string;
};

export type WorkerMessageProgress = {
  max: number;
  value: number;
  info: { [columnName: string]: number };
};

export type WorkerMessageSubmission = {
  score: number;
  textContent: string;
};

export type WorkerMessageEndSolver = 'done';
