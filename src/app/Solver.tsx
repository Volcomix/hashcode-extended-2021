import React, { useState } from 'react';
import { getDatasetInfo } from '../dataset';
import { WorkerMessageStartSolver } from '../helpers/worker';
import { Dataset } from '../model';
import './Solver.css';

type SolverProps = {
  datasets: Dataset[];
};

function Solver({ datasets }: SolverProps) {
  const [selectedDatasets, setSelectedDatasets] = useState(
    datasets.map(() => false)
  );

  const isSomeSelected = selectedDatasets.includes(true);
  const areAllSelected = !selectedDatasets.includes(false);

  const datasetsInfos = datasets.map(getDatasetInfo);

  function selectOrDeselectAll() {
    setSelectedDatasets(datasets.map(() => !areAllSelected));
  }

  function switchDatasetSelection(clickedIndex: number) {
    setSelectedDatasets(
      selectedDatasets.map((isSelected, i) =>
        i === clickedIndex ? !isSelected : isSelected
      )
    );
  }

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
      });
  }

  return (
    <div className="Solver">
      <div className="Solver-table">
        <table>
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    ref={(el) =>
                      el &&
                      (el.indeterminate = isSomeSelected && !areAllSelected)
                    }
                    checked={areAllSelected}
                    onChange={selectOrDeselectAll}
                  />
                  Dataset
                </label>
              </th>
              {Object.keys(datasetsInfos[0]).map((columnName) => (
                <th key={columnName}>{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset, i) => (
              <tr key={dataset.name}>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedDatasets[i]}
                      onChange={() => switchDatasetSelection(i)}
                    />
                    {dataset.name}
                  </label>
                </td>
                {Object.values(datasetsInfos[i]).map((value, j) => (
                  <td key={`${dataset.name}-info-${j}`}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={solve}>Solve</button>
    </div>
  );
}

export default Solver;
