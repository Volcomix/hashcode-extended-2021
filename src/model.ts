export type Dataset = {
  name: string;
  duration: number;
  streets: Street[];
  intersections: Intersection[];
  cars: Car[];
  bonusPerCar: number;
};

export type Street = {
  id: number;
  name: string;
  from: Intersection;
  to: Intersection;
  duration: number;
};

export type Intersection = {
  id: number;
  arrivals: Street[];
  departures: Street[];
};

export type Car = {
  path: Street[];
};

export type Submission = {
  schedules: Schedule[];
  score: number;
};

export type ScheduleItem = {
  street: Street;
  duration: number;
};

export type Schedule = {
  intersection: Intersection;
  items: ScheduleItem[];
};
