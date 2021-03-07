import React from 'react';
import {
  WorkerMessageProgress,
  WorkerMessageSubmission,
} from '../helpers/worker';
import { Dataset } from '../model';
import Table from './shared/Table';
import './SubmissionTable.css';

type SubmissionTableProps = {
  datasets: Dataset[];
  progress: WorkerMessageProgress[];
  submissionsMessages: WorkerMessageSubmission[];
  submissionsUrls: (string | null)[];
};

function SubmissionTable({
  datasets,
  progress,
  submissionsMessages,
  submissionsUrls,
}: SubmissionTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Dataset</th>
          <th>Submission</th>
        </tr>
      </thead>
      <tbody>
        {datasets.map((dataset, i) => {
          const submissionUrl = submissionsUrls[i];
          if (submissionUrl === null) {
            return null;
          }
          const datasetProgress = progress[i];
          const submissionMessage = submissionsMessages[i];
          const submissionFileName = `${dataset.name}-${submissionMessage.score}.txt`;

          return (
            <tr key={dataset.name}>
              <td>{dataset.name}</td>
              <td className="SubmissionTable-submission">
                {submissionUrl === 'canceled' ? (
                  'Canceled'
                ) : submissionUrl ? (
                  <a href={submissionUrl} download={submissionFileName}>
                    {submissionFileName}
                  </a>
                ) : (
                  // TODO Display actual progress if any
                  <progress
                    max={datasetProgress.max}
                    value={datasetProgress.value}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default SubmissionTable;
