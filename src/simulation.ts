import {
  Car,
  Dataset,
  Intersection,
  Schedule,
  Street,
  Submission,
} from './model';

type StateProgress = {
  index: number;
  endSecond: number;
};

type State = {
  second: number;
  lightQueues: Map<Street, Car[]>;
  intersectionProgress: Map<Intersection, StateProgress>;
  carProgress: Map<Car, StateProgress>;
};

export function initSimulation(
  dataset: Dataset,
  submission: Submission
): State {
  console.clear();
  return {
    second: 0,
    lightQueues: new Map(dataset.streets.map((street) => [street, []])),
    intersectionProgress: new Map(
      submission.schedules.map((schedule) => [
        schedule.intersection,
        { index: 0, endSecond: schedule.items[0].duration } as StateProgress,
      ])
    ),
    carProgress: new Map(
      dataset.cars.map((car) => [
        car,
        { index: 0, endSecond: 0 } as StateProgress,
      ])
    ),
  };
}

export function simulateStep(
  dataset: Dataset,
  submission: Submission,
  state: State
) {
  console.log(`=== ${state.second}s `.padEnd(50, '='));

  const greenLights = new Map(
    submission.schedules.map((schedule) => {
      const progress = state.intersectionProgress.get(schedule.intersection)!;
      let scheduleItem = schedule.items[progress.index];

      if (state.second === progress.endSecond) {
        progress.index = (progress.index + 1) % schedule.items.length;
        scheduleItem = schedule.items[progress.index];
        progress.endSecond = state.second + scheduleItem.duration;
      }

      return [schedule.intersection, scheduleItem.street];
    })
  );
  console.log('Green lights:');
  dataset.intersections.forEach((intersection, i) => {
    console.log(' ', i, greenLights.get(intersection)?.name || '---');
  });

  const carStreets = new Map(
    dataset.cars.map((car) => {
      const progress = state.carProgress.get(car)!;
      return [car, car.path[progress.index]];
    })
  );
  console.log('Cars:');
  dataset.cars.forEach((car, i) => {
    const street = carStreets.get(car)!;
    const positionInQueue = state.lightQueues.get(street)!.indexOf(car);
    if (positionInQueue === -1) {
      console.log(' ', i, street.name);
    } else {
      console.log(
        ' ',
        i,
        street.name,
        `(queued in position ${positionInQueue})`
      );
    }
  });

  console.log('-'.repeat(50));

  dataset.cars.forEach((car, i) => {
    const progress = state.carProgress.get(car)!;
    if (state.second === progress.endSecond) {
      let street = car.path[progress.index];

      const isLightGreen = greenLights.get(street.to) === street;

      if (isLightGreen) {
        // TODO Handle stopped by queued cars
        console.log('Car', i, 'crosses immediately intersection', street.to.id);
        progress.index++;
        street = car.path[progress.index];
        progress.endSecond = state.second + street.duration;
      } else {
        console.log('Car', i, 'stopped by red light');
        state.lightQueues.get(street)!.push(car);
      }
    }
  });

  state.second++;
}

export function simulate(dataset: Dataset, submission: Submission) {
  const lights = new Map<Intersection, Street>();
  const carsByLight = new Map<Street, Car[]>(
    dataset.streets.map((street) => [street, []])
  );
  const schedulesByIntersection = new Map<Intersection, Schedule>(
    submission.schedules.map((schedule) => [schedule.intersection, schedule])
  );
  const scheduleItemIdxs = new Map<Intersection, number>(
    submission.schedules.map((schedule) => [schedule.intersection, -1])
  );
  const secondsToNextScheduleItem = new Map<Intersection, number>(
    submission.schedules.map((schedule) => [schedule.intersection, 0])
  );
  const streetIdxs = new Map<Car, number>(dataset.cars.map((car) => [car, 1]));
  const secondsToEnd = new Map<Car, number>(
    dataset.cars.map((car) => [car, 0])
  );
  const drivingCars = new Set<Car>();

  for (const car of dataset.cars) {
    carsByLight.get(car.path[0])!.push(car);
  }

  let score = 0;

  for (let second = 0; second < dataset.duration; second++) {
    for (const intersection of dataset.intersections) {
      const schedule = schedulesByIntersection.get(intersection);
      if (!schedule) {
        continue;
      }
      const secondToNextScheduleItem = secondsToNextScheduleItem.get(
        intersection
      )!;
      if (secondToNextScheduleItem === second) {
        let scheduleItemIdx = scheduleItemIdxs.get(intersection)!;
        scheduleItemIdx = (scheduleItemIdx + 1) % schedule.items.length;
        scheduleItemIdxs.set(intersection, scheduleItemIdx);
        const scheduleItem = schedule.items[scheduleItemIdx];
        lights.set(intersection, scheduleItem.street);
        secondsToNextScheduleItem.set(
          intersection,
          second + scheduleItem.duration
        );
      }
    }
    for (const car of drivingCars) {
      const secondToEnd = secondsToEnd.get(car)!;
      if (secondToEnd === second) {
        let streetIdx = streetIdxs.get(car)!;
        drivingCars.delete(car);
        if (streetIdx === car.path.length - 1) {
          score += dataset.bonusPerCar + dataset.duration - second;
          continue;
        }
        const street = car.path[streetIdx];
        carsByLight.get(street)!.push(car);
        streetIdx++;
        streetIdxs.set(car, streetIdx);
      }
    }
    for (const street of lights.values()) {
      const car = carsByLight.get(street)!.shift();
      if (!car) {
        continue;
      }
      drivingCars.add(car);
      let streetIdx = streetIdxs.get(car)!;
      const nextStreet = car.path[streetIdx];
      secondsToEnd.set(car, second + nextStreet.duration);
    }
  }

  submission.score = score;
}
