import React from 'react';
import { Dataset } from '../model';
import Table from './shared/Table';
import './SubmissionTable.css';

type SubmissionTableProps = {
  datasets: Dataset[];
  scores: number[];
  submissionsUrls: (string | null)[];
};

function SubmissionTable({
  datasets,
  scores,
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
          const submissionFileName = `${dataset.name}-${scores[i]}.txt`;

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
                  <progress />
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
