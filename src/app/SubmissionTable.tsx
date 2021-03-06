import React from 'react';
import { Dataset } from '../model';
import Table from './shared/Table';
import './SubmissionTable.css';

type SubmissionTableProps = {
  datasets: Dataset[];
  submissionsUrls: string[];
};

function SubmissionTable({ datasets, submissionsUrls }: SubmissionTableProps) {
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
          const submissionFileName = `${dataset.name}-0.txt`;

          return (
            <tr key={dataset.name}>
              <td>{dataset.name}</td>
              <td className="SubmissionTable-submission">
                {submissionUrl ? (
                  <a href={submissionUrl} download={submissionFileName}>
                    {submissionFileName}
                  </a>
                ) : (
                  // TODO Display actual progress if any
                  // TODO Handle canceling single submission
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
