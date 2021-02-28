import React, { useEffect, useState } from 'react';
import * as datasetUrls from '../../dataset';
import { parseDataset } from '../dataset';
import { Dataset } from '../model';
import './App.css';
import Solver from './Solver';

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    async function fetchDatasets() {
      setDatasets(
        await Promise.all(
          Object.entries(datasetUrls).map(async ([datasetName, datasetUrl]) => {
            const response = await fetch(datasetUrl);
            const textContent = await response.text();
            return parseDataset(datasetName, textContent);
          })
        )
      );
    }
    fetchDatasets();
  }, []);

  return (
    <div className="App">
      {datasets.length ? <Solver datasets={datasets} /> : <progress />}
    </div>
  );
}

export default App;
