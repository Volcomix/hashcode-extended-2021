import { trimLines } from './helpers/string';
import { Car, Dataset, Intersection, Street } from './model';

export async function fetchDataset(
  datasetName: string,
  datasetUrl: string
): Promise<Dataset> {
  const response = await fetch(datasetUrl);
  const textContent = await response.text();

  const [header, ...lines] = trimLines(textContent.split('\n'));

  const [
    duration,
    intersectionsCount,
    streetsCount,
    _carsCount,
    bonusPerCar,
  ] = header.split(' ').map(Number);

  const intersections: Intersection[] = Array.from(
    { length: intersectionsCount },
    (_, id) => ({ id, arrivals: [], departures: [] })
  );

  const streetsLines = lines.slice(0, streetsCount);
  const carsLines = lines.slice(streetsCount);

  const streets: Street[] = streetsLines.map((line, id) => {
    const [from, to, name, duration] = line.split(' ');
    const street = {
      id,
      name,
      from: intersections[Number(from)],
      to: intersections[Number(to)],
      duration: Number(duration),
    };
    street.from.departures.push(street);
    street.to.arrivals.push(street);
    return street;
  });

  const streetsByName = new Map(streets.map((street) => [street.name, street]));

  const cars: Car[] = carsLines.map((line) => ({
    path: line
      .split(' ')
      .slice(1)
      .map((streetName) => streetsByName.get(streetName)!),
  }));

  return {
    name: datasetName,
    url: datasetUrl,
    duration,
    streets,
    intersections,
    cars,
    bonusPerCar,
  };
}

export function getDatasetInfo(dataset: Dataset) {
  const streetsDurations = dataset.streets.map((street) => street.duration);
  const pathsLengths = dataset.cars.map((car) => car.path.length);
  const carsCountByStreet = getCarsCountByStreet(dataset);
  const carsCountByIntersection = getCarsCountByIntersection(dataset);
  return {
    Duration: dataset.duration,
    Streets: dataset.streets.length,
    'Avg street duration': avg(streetsDurations),
    'Min street duration': min(streetsDurations),
    'Max street duration': max(streetsDurations),
    'Avg cars per street': avg(carsCountByStreet),
    'Min cars per street': min(carsCountByStreet),
    'Max cars per street': max(carsCountByStreet),
    Intersections: dataset.intersections.length,
    'Avg cars per intersection': avg(carsCountByIntersection),
    'Min cars per intersection': min(carsCountByIntersection),
    'Max cars per intersection': max(carsCountByIntersection),
    Cars: dataset.cars.length,
    'Avg path length': avg(pathsLengths),
    'Min path length': min(pathsLengths),
    'Max path length': max(pathsLengths),
    'Bonus per car': dataset.bonusPerCar,
  };
}

export function getCarsCountByStreet(dataset: Dataset): number[] {
  const carsCounts = dataset.streets.map(() => 0);
  for (const car of dataset.cars) {
    for (const street of car.path) {
      carsCounts[street.id]++;
    }
  }
  return carsCounts;
}

export function getCarsCountByIntersection(dataset: Dataset): number[] {
  const carsCounts = dataset.intersections.map(() => 0);
  for (const car of dataset.cars) {
    for (const street of car.path.slice(0, -1)) {
      carsCounts[street.to.id]++;
    }
  }
  return carsCounts;
}

function avg(values: number[]): string {
  const sum = values.reduce((acc, value) => acc + value, 0);
  return (sum / values.length).toFixed(2);
}

function min(values: number[]): string {
  return Math.min(...values).toFixed(2);
}

function max(values: number[]): string {
  return Math.max(...values).toFixed(2);
}
