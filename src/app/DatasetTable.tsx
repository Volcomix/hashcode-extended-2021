import React from 'react';
import { getDatasetInfo } from '../dataset';
import { Dataset } from '../model';
import './DatasetTable.css';
import Table from './shared/Table';

type DatasetTableProps = {
  datasets: Dataset[];
  selectedDatasets: boolean[];
  onSelectedDatasetsChange: (selectedDatasets: boolean[]) => void;
};

function DatasetTable(props: DatasetTableProps) {
  const { datasets, selectedDatasets, onSelectedDatasetsChange } = props;
  const datasetsInfos = datasets.map(getDatasetInfo);
  const isSomeSelected = selectedDatasets.includes(true);
  const areAllSelected = !selectedDatasets.includes(false);

  function selectOrDeselectAll() {
    onSelectedDatasetsChange(datasets.map(() => !areAllSelected));
  }

  function switchDatasetSelection(clickedIndex: number) {
    onSelectedDatasetsChange(
      selectedDatasets.map((isSelected, i) =>
        i === clickedIndex ? !isSelected : isSelected
      )
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <th className="DatasetTable-checkbox">
            <label>
              <input
                type="checkbox"
                ref={(el) =>
                  el && (el.indeterminate = isSomeSelected && !areAllSelected)
                }
                checked={areAllSelected}
                onChange={selectOrDeselectAll}
              />
              Dataset
            </label>
          </th>
          {Object.keys(datasetsInfos[0]).map((columnName) => (
            <th key={columnName} className="DatasetTable-number">
              {columnName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {datasets.map((dataset, i) => (
          <tr key={dataset.name}>
            <td className="DatasetTable-checkbox">
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
              <td
                key={`${dataset.name}-info-${j}`}
                className="DatasetTable-number"
              >
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default DatasetTable;
