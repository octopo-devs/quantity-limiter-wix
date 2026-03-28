export interface IWeekWorkingDay {
  day: number;
  cut_off_after: string;
  enable?: number;
}

export interface IWeekWorkingDays {
  prepareAndDelivery: IWeekWorkingDay[];
  prepare: IWeekWorkingDay[];
  delivery: IWeekWorkingDay[];
}

export interface IOption {
  label: string;
  value: string;
}
