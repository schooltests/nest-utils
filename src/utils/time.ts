import * as moment from 'moment';

export const now = () => moment().toDate();
export const nowAdd = (amount?: moment.DurationInputArg1, unit?: moment.DurationInputArg2) => moment().add(amount, unit);
export const nowRemove = (amount?: moment.DurationInputArg1, unit?: moment.DurationInputArg2) =>
  moment().subtract(amount, unit).toDate();

export const computeDuration = (startingTime: moment.MomentInput) =>
  moment.duration({
    from: moment().add(moment.duration(moment(startingTime).diff(moment()))),
    to: moment(),
  });

const oneSecondInMs = 1000;

export const minuteInS = 60;
export const hourInS = 60 * minuteInS;
export const dayInS = hourInS * 24;

export const minuteInMS = minuteInS * oneSecondInMs;
export const fiveMinutesInMS = minuteInMS * 5;
export const hourInMS = 60 * minuteInMS;
export const dayInMS = hourInMS * 24;
export const weekInMs = 7 * dayInMS;
export const monthInMs = 4 * weekInMs;
export const yearInMs = 12 * monthInMs;

export const ASKTHM = minuteInMS / 2 - 1;

export const oneDaySimple = 24;
export const halfHourSimple = 30;
