/* eslint-disable @typescript-eslint/no-loop-func */
import { IParamsApi } from '@/types/apis/params';
import dayjs from 'dayjs';
import moment from 'moment';

export function validateTime(time: string) {
  const timeReg = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return time.match(timeReg);
}
export const getSomeDaysAgo = (day: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0);
  return date;
};
export const formatDate = (date: number | Date | string, format?: string) => {
  return moment(typeof date === 'number' ? date * 1000 : date).format(format ? format : 'D MMM YYYY, h:mm a');
};

export const formatDateOption = (formatType: string, lang: string) => {
  return moment().locale(lang).format(formatType);
};

const parseTimezone = (rawTimezone: string): string => {
  if (!rawTimezone) {
    return '';
  }
  // Extract the timezone from the raw timezone string
  const timezone = rawTimezone.split(':')[0];
  return timezone;
};
export const createDateByTimezoneOffset = (timezoneOffset: string, currentDay?: Date): Date => {
  if (timezoneOffset === 'Default customer timezone' || !timezoneOffset) {
    return currentDay ? new Date(currentDay) : new Date();
  }
  const date = dayjs(currentDay || new Date());
  const timezone = parseTimezone(timezoneOffset);
  const timezoneDate = date.tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  return new Date(timezoneDate);
};

export const formatDateYYYYMMDD = (time: Date): string => {
  const day = time.getDate().toString().padStart(2, '0');
  const month = (time.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month to account for zero-based index
  const year = time.getFullYear();
  return `${year}-${month}-${day}`;
};

export const isDateAfterCutoffTime = (date: Date, workingDays: IParamsApi.IWeekWorkingDay[]) => {
  const today = date.getDay();
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const weekDay = workingDays.find((item) => item.day === today);
  const condition = weekDay?.cut_off_after.split(':');
  let conditionHour;
  let conditionMinute;
  if (condition) {
    conditionHour = Number(condition[0]);
    conditionMinute = Number(condition[1]);
  }

  if (
    !weekDay?.enable ||
    (conditionHour !== undefined && currentHour > conditionHour) ||
    (currentHour === conditionHour && conditionMinute && currentMinute >= conditionMinute)
  ) {
    return true;
  }
  return false;
};

export const increaseDateTimeByDays = (currentDay: Date, daysToAdd: number): Date => {
  const increasedDate = new Date(currentDay.getTime()); // Clone the date to avoid mutating the original
  increasedDate.setDate(increasedDate.getDate() + daysToAdd);
  return increasedDate;
};

export const getLastMonth = () => {
  const firstDate = new Date();
  firstDate.setDate(1);
  firstDate.setMonth(firstDate.getMonth() - 1);
  const lastDate = new Date();
  lastDate.setDate(0);
  return {
    start: firstDate,
    end: lastDate,
  };
};

export const getLastSomesMonth = (month: number) => {
  const firtDate = new Date();
  firtDate.setDate(1);
  firtDate.setMonth(firtDate.getMonth() - month);
  const lastDate = new Date();
  lastDate.setMonth(lastDate.getMonth() - month + 1);
  lastDate.setDate(0);
  return {
    start: firtDate,
    end: lastDate,
  };
};

export const getArrayDateFromStartDateToEndDate = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  // Clone endDate để không ảnh hưởng đến tham số gốc
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(currentDate.toLocaleDateString('en-US'));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
