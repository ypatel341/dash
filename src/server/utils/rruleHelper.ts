import { RRule, Frequency } from 'rrule';
import dayjs from 'dayjs';
import {
  SUPPORTED_RRULE_FREQUENCIES,
  DEFAULT_MATERIALIZATION_HORIZON_DAYS,
  YEARLY_MATERIALIZATION_THROUGH,
} from './consts';

const FREQ_NAME_MAP: Record<number, string> = {
  [Frequency.YEARLY]: 'YEARLY',
  [Frequency.MONTHLY]: 'MONTHLY',
  [Frequency.WEEKLY]: 'WEEKLY',
  [Frequency.DAILY]: 'DAILY',
  [Frequency.HOURLY]: 'HOURLY',
  [Frequency.MINUTELY]: 'MINUTELY',
  [Frequency.SECONDLY]: 'SECONDLY',
};

export const validateRRule = (ruleString: string): void => {
  let rule: RRule;
  try {
    rule = RRule.fromString(ruleString);
  } catch {
    throw new Error(`Invalid recurrence rule: ${ruleString}`);
  }

  const freqName = FREQ_NAME_MAP[rule.options.freq];
  if (
    !freqName ||
    !(SUPPORTED_RRULE_FREQUENCIES as readonly string[]).includes(freqName)
  ) {
    throw new Error(
      `Unsupported frequency: ${freqName || rule.options.freq}. Supported: ${SUPPORTED_RRULE_FREQUENCIES.join(', ')}`,
    );
  }
};

export const getRecurrenceFrequency = (rruleString: string): string => {
  const match = rruleString.match(/FREQ=(\w+)/);
  return match ? match[1] : 'DAILY';
};

export const getRecurrenceInterval = (rruleString: string): number => {
  const match = rruleString.match(/INTERVAL=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

export const getMaterializationHorizon = (rruleString: string): string => {
  const frequency = getRecurrenceFrequency(rruleString);
  const interval = getRecurrenceInterval(rruleString);

  if (frequency === 'YEARLY' || (frequency === 'MONTHLY' && interval === 6)) {
    return YEARLY_MATERIALIZATION_THROUGH;
  }

  return dayjs()
    .add(DEFAULT_MATERIALIZATION_HORIZON_DAYS, 'day')
    .format('YYYY-MM-DD');
};

export const expandRRule = (
  ruleString: string,
  startsOn: string,
  after: string,
  before: string,
  endsOn?: string | null,
): string[] => {
  const effectiveBefore = endsOn && endsOn < before ? endsOn : before;

  const parsed = RRule.parseString(ruleString);
  const rule = new RRule({
    ...parsed,
    dtstart: new Date(startsOn + 'T00:00:00Z'),
  });

  const afterDate = new Date(after + 'T00:00:00Z');
  const beforeDate = new Date(effectiveBefore + 'T00:00:00Z');

  // between with inc=true includes both boundaries; filter out afterDate for exclusive lower bound
  const dates = rule.between(afterDate, beforeDate, true);

  return dates
    .filter((d) => d.getTime() > afterDate.getTime())
    .map((d) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
};
