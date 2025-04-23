import { parseDate } from '~/utils/date-utils';

export const formatToHumanReadableMonth = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableDay = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableTime = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableDate = (
  date: Date | string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};
