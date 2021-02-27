import React, { useState } from 'react';
import * as datasetUrls from '../dataset';
import './App.css';

type SelectedDatasets = { [datasetName: string]: boolean };

const initialSelectedDatasets = Object.keys(datasetUrls).reduce(
  (acc, datasetName) => Object.assign(acc, { [datasetName]: false }),
  {} as SelectedDatasets
);

function App() {
  const [selectedDatasets, setSelectedDatasets] = useState<SelectedDatasets>(
    initialSelectedDatasets
  );

  function updateSelection(datasetName: string) {
    setSelectedDatasets({
      ...selectedDatasets,
      [datasetName]: !selectedDatasets[datasetName],
    });
  }

  function solve() {
    console.log(
      'Solving...',
      Object.entries(selectedDatasets)
        .filter(([_datasetName, isSelected]) => isSelected)
        .map(([datasetName]) => datasetName)
    );
  }

  return (
    <div className="App">
      {Object.keys(datasetUrls).map((datasetName) => (
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
