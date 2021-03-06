import React, { useState } from 'react';
import {
  WorkerMessageStartSolver,
  WorkerMessageSubmission,
} from '../helpers/worker';
import { Dataset } from '../model';
import DatasetTable from './DatasetTable';
import './Solver.css';

type SolverProps = {
  datasets: Dataset[];
};

type SubmissionBlob = {
  datasetName: string;
  score: number;
  url: string;
};

function Solver({ datasets }: SolverProps) {
  const [selectedDatasets, setSelectedDatasets] = useState(
    datasets.map(() => true)
  );
  const [submissionsBlobs, setSubmissionsBlobs] = useState<SubmissionBlob[]>(
    []
  );

  function solve() {
    datasets
      .filter((_dataset, i) => selectedDatasets[i])
      .map((dataset) => {
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
          const submissionBlob: SubmissionBlob = {
            datasetName: dataset.name,
            score: ev.data.score,
            url: URL.createObjectURL(blob),
          };
          setSubmissionsBlobs((prev) => [...prev, submissionBlob]);
        };
      });
  }

  return (
    <div className="Solver">
      <DatasetTable
        datasets={datasets}
        selectedDatasets={selectedDatasets}
        onSelectedDatasetsChange={setSelectedDatasets}
      />
      <button onClick={solve}>Solve</button>
      {submissionsBlobs.map((submissionBlob) => (
        <a
          key={submissionBlob.url}
          href={submissionBlob.url}
          download={`${submissionBlob.datasetName}-${submissionBlob.score}`}
        >
          {submissionBlob.datasetName} ({submissionBlob.score})
        </a>
      ))}
    </div>
  );
}

export default Solver;
