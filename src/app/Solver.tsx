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
  const [submissionsUrls, setSubmissionsUrls] = useState<string[]>([]);

  function solve() {
    setSubmissionsUrls(datasets.map(() => ''));
    datasets
      .filter((_dataset, i) => selectedDatasets[i])
      .forEach((dataset, datasetIndex) => {
        const worker = new Worker(
          new URL('/src/solvers/minimal.js', import.meta.url),
          { type: 'module' }
        );
        worker.postMessage({
          datasetName: dataset.name,
          datasetUrl: dataset.url,
        } as WorkerMessageStartSolver);
        worker.onmessage = (ev: MessageEvent<WorkerMessageSubmission>) => {
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
      });
  }

  function cancelAll() {
    // TODO Handle cancel all
  }

  return (
    <div className="Solver">
      <DatasetTable
        datasets={datasets}
        selectedDatasets={selectedDatasets}
        onSelectedDatasetsChange={setSelectedDatasets}
      />
      {submissionsUrls.every(Boolean) ? (
        <button onClick={solve}>Solve</button>
      ) : (
        <button onClick={cancelAll}>Cancel</button>
      )}
      {submissionsUrls.length > 0 && (
        // TODO Handle solving part of the datasets
        <SubmissionTable
          datasets={datasets}
          submissionsUrls={submissionsUrls}
        />
      )}
    </div>
  );
}

export default Solver;
