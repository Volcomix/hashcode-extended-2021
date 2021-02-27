import React, { useState } from 'react';
import { getDatasetInfo } from '../dataset';
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

  async function solve() {
    console.log(datasets.filter((_dataset, i) => selectedDatasets[i]));
  }

  return (
    <div className="Solver">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                ref={(el) =>
                  el && (el.indeterminate = isSomeSelected && !areAllSelected)
                }
                checked={areAllSelected}
                onChange={selectOrDeselectAll}
              />
            </th>
            <th>Dataset</th>
            {Object.keys(datasetsInfos[0]).map((columnName) => (
              <th key={columnName}>{columnName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset, i) => (
            <tr key={dataset.name}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedDatasets[i]}
                  onChange={() => switchDatasetSelection(i)}
                />
              </td>
              <td>{dataset.name}</td>
              {Object.values(datasetsInfos[i]).map((value, j) => (
                <td key={`${dataset.name}-info-${j}`}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={solve}>Solve</button>
    </div>
  );
}

export default Solver;
