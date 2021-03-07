import { Car, Dataset, Intersection, Street, Submission } from './model';

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
  // console.clear();
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
  // console.log(`=== ${state.second}s `.padEnd(50, '='));

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
  // console.log('Green lights:');
  // dataset.intersections.forEach((intersection, i) => {
  //   console.log(' ', i, greenLights.get(intersection)?.name || '---');
  // });

  // const carStreets = new Map(
  //   dataset.cars.map((car) => {
  //     const progress = state.carProgress.get(car)!;
  //     return [car, car.path[progress.index]];
  //   })
  // );
  // console.log('Cars:');
  // dataset.cars.forEach((car, i) => {
  //   const street = carStreets.get(car)!;
  //   const positionInQueue = state.lightQueues.get(street)!.indexOf(car);
  //   if (positionInQueue === -1) {
  //     console.log(' ', i, street.name);
  //   } else {
  //     console.log(
  //       ' ',
  //       i,
  //       street.name,
  //       `(queued in position ${positionInQueue})`
  //     );
  //   }
  // });

  // console.log('-'.repeat(50));

  dataset.cars.forEach((car, i) => {
    const progress = state.carProgress.get(car)!;
    if (state.second === progress.endSecond) {
      if (progress.index < car.path.length - 1) {
        const street = car.path[progress.index];
        state.lightQueues.get(street)!.push(car);
        // console.log('Car', i, 'has reached the end of', street.name);
      } else {
        const score = dataset.bonusPerCar + dataset.duration - state.second;
        // console.log(
        //   'Car',
        //   i,
        //   'has reached its destination and scores',
        //   score,
        //   'points'
        // );
        submission.score += score;
      }
    }
  });

  dataset.intersections.forEach((intersection) => {
    let street = greenLights.get(intersection);
    if (!street) {
      return;
    }
    const queue = state.lightQueues.get(street)!;
    if (!queue.length) {
      return;
    }
    const car = queue.shift()!;
    // console.log(
    //   'Car',
    //   dataset.cars.indexOf(car),
    //   'crosses intersection',
    //   intersection.id
    // );
    const progress = state.carProgress.get(car)!;
    progress.index++;
    street = car.path[progress.index];
    progress.endSecond = state.second + street.duration;
  });

  state.second++;
}
