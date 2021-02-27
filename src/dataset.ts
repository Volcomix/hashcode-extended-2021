import { trimLines } from './helpers/string';
import { Car, Dataset, Intersection, Street } from './model';

export function parseDataset(
  datasetName: string,
  textContent: string
): Dataset {
  const [header, ...lines] = trimLines(textContent.split('\n'));

  const [
    duration,
    intersectionsCount,
    streetsCount,
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
    duration,
    streets,
    intersections,
    cars,
    bonusPerCar,
  };
}
