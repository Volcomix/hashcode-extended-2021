import React, { useEffect, useState } from 'react';
import * as datasetUrls from '../../datasets';
import { fetchDataset } from '../dataset';
import { Dataset } from '../model';
import './App.css';
import Solver from './Solver';

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    async function fetchDatasets() {
      setDatasets(
        await Promise.all(
          Object.entries(datasetUrls).map(([datasetName, datasetUrl]) =>
            fetchDataset(datasetName, datasetUrl)
          )
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
