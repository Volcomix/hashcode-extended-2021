import React, { useState } from 'react';
import {
  WorkerMessageEndSolver,
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

const solvers = {
  example: 'Example',
  minimal: 'Minimal',
  weight: 'Weight',
  iterative: 'Iterative',
};

function Solver({ datasets }: SolverProps) {
  const [selectedDatasets, setSelectedDatasets] = useState(
    datasets.map(() => true)
  );
  const [solverName, setSolverName] = useState<string>(Object.keys(solvers)[0]);
  const [workers, setWorkers] = useState<(Worker | null)[]>(
    datasets.map(() => null)
  );
  const [progress, setProgress] = useState<WorkerMessageProgress[]>(
    datasets.map(() => ({} as WorkerMessageProgress))
  );
  const [submissionsMessages, setSubmissionsMessages] = useState<
    WorkerMessageSubmission[]
  >(datasets.map(() => ({ score: 0 } as WorkerMessageSubmission)));
  const [submissionsUrls, setSubmissionsUrls] = useState<(string | null)[]>(
    datasets.map(() => null)
  );

  function solve() {
    setProgress(datasets.map(() => ({} as WorkerMessageProgress)));
    setSubmissionsMessages(
      datasets.map(() => ({ score: 0 } as WorkerMessageSubmission))
    );
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
          ev: MessageEvent<
            | WorkerMessageProgress
            | WorkerMessageSubmission
            | WorkerMessageEndSolver
          >
        ) => {
          if (ev.data === 'done') {
            worker.terminate();
            const submissionMessage = submissionsMessages[datasetIndex];
            const submissionUrl = getSubmissionUrl(submissionMessage);
            setSubmissionsUrls((prevSubmissionsUrls) =>
              prevSubmissionsUrls.map(
                (prevSubmissionUrl, prevSubmissionUrlIndex) =>
                  prevSubmissionUrlIndex === datasetIndex
                    ? submissionUrl
                    : prevSubmissionUrl
              )
            );
          } else if ('value' in ev.data) {
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
            setSubmissionsMessages((prevSubmissions) =>
              prevSubmissions.map((prevSubmission, prevSubmissionIndex) =>
                prevSubmissionIndex === datasetIndex
                  ? submissionMessage
                  : prevSubmission
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
          const submissionMessage = submissionsMessages[i];
          if (submissionMessage.textContent) {
            return getSubmissionUrl(submissionMessage);
          } else {
            return 'canceled';
          }
        }
        return prevSubmissionsUrls[i];
      })
    );
  }

  function getSubmissionUrl(submissionMessage: WorkerMessageSubmission) {
    const blob = new Blob([submissionMessage.textContent], {
      type: 'text/plain',
    });
    return URL.createObjectURL(blob);
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
          {Object.entries(solvers).map(([solverName, solverDisplayName]) => (
            <option key={solverName} value={solverName}>
              {solverDisplayName}
            </option>
          ))}
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
          submissionsMessages={submissionsMessages}
          submissionsUrls={submissionsUrls}
        />
      )}
    </div>
  );
}

export default Solver;
