import React, { useState } from 'react';
import {
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
  const [submissionsUrls, setSubmissionsUrls] = useState<(string | null)[]>(
    datasets.map(() => null)
  );

  function solve() {
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
        worker.onmessage = (ev: MessageEvent<WorkerMessageSubmission>) => {
          worker.terminate();
          localStorage.setItem(dataset.name, JSON.stringify(ev.data));
          const blob = new Blob([ev.data.textContent], {
            type: 'text/plain',
          });
          const submissionUrl = URL.createObjectURL(blob);
          setSubmissionsUrls((prevSubmissionsUrls) =>
            prevSubmissionsUrls.map(
              (prevSubmissionUrl, prevSubmissionUrlIndex) =>
                prevSubmissionUrlIndex === datasetIndex
                  ? submissionUrl
                  : prevSubmissionUrl
            )
          );
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
          submissionsUrls={submissionsUrls}
        />
      )}
    </div>
  );
}

export default Solver;
