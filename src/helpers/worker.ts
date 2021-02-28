export type WorkerMessageStartSolver = {
  datasetName: string;
  datasetUrl: string;
};

export type WorkerMessageSubmission = {
  score: number;
  textContent: string;
};
