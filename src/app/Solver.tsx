import React, { useState } from 'react';
import {
  WorkerMessageProgress,
  WorkerMessageStartSolver,
  WorkerMessageSubmission,
} from '../helpers/worker';
import { Dataset } from '../model';
import DatasetTable from './DatasetTable';
import './Solver.css';
import SubmissionTable from './SubmissionTable';

type SolverProps = {
  datasets: Dataset[];
};

function Solver({ datasets }: SolverProps) {
  const [selectedDatasets, setSelectedDatasets] = useState(
    datasets.map(() => true)
  );
  const [solverName, setSolverName] = useState<string>('minimal');
  const [workers, setWorkers] = useState<(Worker | null)[]>(
    datasets.map(() => null)
  );
  const [progress, setProgress] = useState<WorkerMessageProgress[]>(
    datasets.map(() => ({} as WorkerMessageProgress))
  );
  const [scores, setScores] = useState<number[]>(datasets.map(() => 0));
  const [submissionsUrls, setSubmissionsUrls] = useState<(string | null)[]>(
    datasets.map(() => null)
  );

  function solve() {
    setProgress(datasets.map(() => ({} as WorkerMessageProgress)));
    setScores(datasets.map(() => 0));
    setSubmissionsUrls(
      datasets.map((_dataset, i) => (selectedDatasets[i] ? '' : null))
    );
    setWorkers(
      datasets.map((dataset, datasetIndex) => {
        if (!selectedDatasets[datasetIndex]) {
          return null;
        }
        const worker = new Worker(
          new URL(`/src/solvers/${solverName}.js`, import.meta.url),
          { type: 'module' }
        );
        worker.postMessage({
          datasetName: dataset.name,
          datasetUrl: dataset.url,
        } as WorkerMessageStartSolver);
        worker.onmessage = (
          ev: MessageEvent<WorkerMessageProgress | WorkerMessageSubmission>
        ) => {
          if ('value' in ev.data) {
            const progressMessage = ev.data;
            setProgress((prevProgress) =>
              prevProgress.map(
                (prevDatasetProgress, prevDatasetProgressIndex) =>
                  prevDatasetProgressIndex === datasetIndex
                    ? progressMessage
                    : prevDatasetProgress
              )
            );
          } else {
            const submissionMessage = ev.data;
            worker.terminate();
            localStorage.setItem(
              dataset.name,
              JSON.stringify(submissionMessage)
            );
            const blob = new Blob([submissionMessage.textContent], {
              type: 'text/plain',
            });
            const submissionUrl = URL.createObjectURL(blob);
            setScores((prevScores) =>
              prevScores.map((prevScore, prevScoreIndex) =>
                prevScoreIndex === datasetIndex
                  ? submissionMessage.score
                  : prevScore
              )
            );
            setSubmissionsUrls((prevSubmissionsUrls) =>
              prevSubmissionsUrls.map(
                (prevSubmissionUrl, prevSubmissionUrlIndex) =>
                  prevSubmissionUrlIndex === datasetIndex
                    ? submissionUrl
                    : prevSubmissionUrl
              )
            );
          }
        };
        return worker;
      })
    );
  }

  function cancelAll() {
    setSubmissionsUrls((prevSubmissionsUrls) =>
      workers.map((worker, i) => {
        if (!worker) {
          return prevSubmissionsUrls[i];
        }
        worker.terminate();
        if (submissionsUrls[i] === '') {
          return 'canceled';
        }
        return prevSubmissionsUrls[i];
      })
    );
  }

  return (
    <div className="Solver">
      <DatasetTable
        datasets={datasets}
        selectedDatasets={selectedDatasets}
        onSelectedDatasetsChange={setSelectedDatasets}
      />
      <div className="Solver-controls">
        <select
          value={solverName}
          onChange={(ev) => setSolverName(ev.target.value)}
        >
          <option value="example">Example</option>
          <option value="minimal">Minimal</option>
          <option value="weight">Weight</option>
        </select>
        {submissionsUrls.some((submissionUrl) => submissionUrl === '') ? (
          <button onClick={cancelAll}>Cancel</button>
        ) : (
          <button onClick={solve}>Solve</button>
        )}
      </div>
      {submissionsUrls.some((submissionUrl) => submissionUrl !== null) && (
        <SubmissionTable
          datasets={datasets}
          progress={progress}
          scores={scores}
          submissionsUrls={submissionsUrls}
        />
      )}
    </div>
  );
}

export default Solver;
