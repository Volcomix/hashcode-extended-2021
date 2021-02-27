import React, { useState } from 'react';
import * as datasetUrls from '../dataset';
import './App.css';

type DatasetName = keyof typeof datasetUrls;
type SelectedDatasets = { [datasetName in DatasetName]: boolean };

const datasetNames = Object.keys(datasetUrls) as DatasetName[];

const allDatasetsNotSelected = datasetNames.reduce(
  (acc, datasetName) => Object.assign(acc, { [datasetName]: false }),
  {} as SelectedDatasets
);
const allDatasetsSelected = datasetNames.reduce(
  (acc, datasetName) => Object.assign(acc, { [datasetName]: true }),
  {} as SelectedDatasets
);

function App() {
  const [selectedDatasets, setSelectedDatasets] = useState<SelectedDatasets>(
    allDatasetsNotSelected
  );

  const isSomeSelected = Object.values(selectedDatasets).some(
    (isSelected) => isSelected
  );
  const areAllSelected = Object.values(selectedDatasets).every(
    (isSelected) => isSelected
  );

  function selectOrDeselectAll() {
    setSelectedDatasets(
      areAllSelected ? allDatasetsNotSelected : allDatasetsSelected
    );
  }

  function updateSelection(datasetName: DatasetName) {
    setSelectedDatasets({
      ...selectedDatasets,
      [datasetName]: !selectedDatasets[datasetName],
    });
  }

  async function solve() {
    const datasetPromises = datasetNames
      .filter((datasetName) => selectedDatasets[datasetName])
      .map(async (datasetName) => {
        const response = await fetch(datasetUrls[datasetName]);
        return { datasetName, textContent: await response.text() };
      });

    for await (const { datasetName, textContent } of datasetPromises) {
      console.log(datasetName, textContent.length);
    }
  }

  return (
    <div className="App">
      <label>
        <input
          type="checkbox"
          ref={(el) =>
            el && (el.indeterminate = isSomeSelected && !areAllSelected)
          }
          checked={areAllSelected}
          onChange={selectOrDeselectAll}
        />
        All
      </label>
      <hr />
      {datasetNames.map((datasetName) => (
        <label key={datasetName}>
          <input
            type="checkbox"
            checked={selectedDatasets[datasetName]}
            onChange={() => updateSelection(datasetName)}
          />
          {datasetName}
        </label>
      ))}
      <button onClick={solve}>Solve</button>
    </div>
  );
}

export default App;
