import {
  validateRRule,
  expandRRule,
  getRecurrenceFrequency,
  getRecurrenceInterval,
  getMaterializationHorizon,
} from '../server/utils/rruleHelper';
import dayjs from 'dayjs';

describe('validateRRule', () => {
  it('should accept FREQ=DAILY', () => {
    expect(() => validateRRule('FREQ=DAILY')).not.toThrow();
  });

  it('should accept FREQ=WEEKLY', () => {
    expect(() => validateRRule('FREQ=WEEKLY;BYDAY=MO')).not.toThrow();
  });

  it('should accept FREQ=MONTHLY', () => {
    expect(() => validateRRule('FREQ=MONTHLY;BYMONTHDAY=15')).not.toThrow();
  });

  it('should accept FREQ=YEARLY', () => {
    expect(() => validateRRule('FREQ=YEARLY')).not.toThrow();
  });

  it('should reject invalid RRULE strings', () => {
    expect(() => validateRRule('NOT_A_RULE')).toThrow(
      'Invalid recurrence rule',
    );
  });

  it('should reject FREQ=HOURLY', () => {
    expect(() => validateRRule('FREQ=HOURLY')).toThrow('Unsupported frequency');
  });

  it('should reject FREQ=MINUTELY', () => {
    expect(() => validateRRule('FREQ=MINUTELY')).toThrow(
      'Unsupported frequency',
    );
  });

  it('should reject FREQ=SECONDLY', () => {
    expect(() => validateRRule('FREQ=SECONDLY')).toThrow(
      'Unsupported frequency',
    );
  });
});

describe('expandRRule', () => {
  it('should expand FREQ=DAILY', () => {
    const dates = expandRRule(
      'FREQ=DAILY',
      '2026-08-01',
      '2026-08-01',
      '2026-08-05',
    );
    expect(dates).toEqual([
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
    ]);
  });

  it('should expand FREQ=WEEKLY;BYDAY=MO,WE,FR', () => {
    const dates = expandRRule(
      'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      '2026-08-03',
      '2026-08-03',
      '2026-08-14',
    );
    // Aug 3 is a Monday (dtstart), after=Aug 3 (exclusive)
    // Next: Wed Aug 5, Fri Aug 7, Mon Aug 10, Wed Aug 12, Fri Aug 14
    expect(dates).toEqual([
      '2026-08-05',
      '2026-08-07',
      '2026-08-10',
      '2026-08-12',
      '2026-08-14',
    ]);
  });

  it('should expand FREQ=MONTHLY;BYMONTHDAY=15', () => {
    const dates = expandRRule(
      'FREQ=MONTHLY;BYMONTHDAY=15',
      '2026-08-15',
      '2026-08-15',
      '2026-11-15',
    );
    expect(dates).toEqual(['2026-09-15', '2026-10-15', '2026-11-15']);
  });

  it('should expand FREQ=YEARLY', () => {
    const dates = expandRRule(
      'FREQ=YEARLY',
      '2026-01-01',
      '2026-01-01',
      '2029-01-01',
    );
    expect(dates).toEqual(['2027-01-01', '2028-01-01', '2029-01-01']);
  });

  it('should respect endsOn boundary', () => {
    const dates = expandRRule(
      'FREQ=DAILY',
      '2026-08-01',
      '2026-08-01',
      '2026-08-10',
      '2026-08-05',
    );
    expect(dates).toEqual([
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
    ]);
  });

  it('should return empty array when no occurrences in range', () => {
    const dates = expandRRule(
      'FREQ=WEEKLY;BYDAY=SA',
      '2026-08-03',
      '2026-08-03',
      '2026-08-07',
    );
    // Aug 3 is Monday, no Saturday before Aug 7
    expect(dates).toEqual([]);
  });

  it('should exclude the after date (exclusive lower bound)', () => {
    const dates = expandRRule(
      'FREQ=DAILY',
      '2026-08-01',
      '2026-08-01',
      '2026-08-03',
    );
    expect(dates[0]).toBe('2026-08-02');
    expect(dates).not.toContain('2026-08-01');
  });

  it('should include the before date (inclusive upper bound)', () => {
    const dates = expandRRule(
      'FREQ=DAILY',
      '2026-08-01',
      '2026-08-01',
      '2026-08-03',
    );
    expect(dates).toContain('2026-08-03');
  });

  it('should handle generatedThrough as after date', () => {
    // Simulates incremental materialization: already generated through Aug 5
    const dates = expandRRule(
      'FREQ=DAILY',
      '2026-08-01',
      '2026-08-05',
      '2026-08-08',
    );
    expect(dates).toEqual(['2026-08-06', '2026-08-07', '2026-08-08']);
  });
});

describe('getRecurrenceFrequency', () => {
  it('returns YEARLY for FREQ=YEARLY', () => {
    expect(getRecurrenceFrequency('FREQ=YEARLY')).toBe('YEARLY');
  });

  it('returns MONTHLY for FREQ=MONTHLY;INTERVAL=6', () => {
    expect(getRecurrenceFrequency('FREQ=MONTHLY;INTERVAL=6')).toBe('MONTHLY');
  });

  it('returns DAILY as default for malformed input', () => {
    expect(getRecurrenceFrequency('INVALID')).toBe('DAILY');
  });
});

describe('getRecurrenceInterval', () => {
  it('returns 6 for INTERVAL=6', () => {
    expect(getRecurrenceInterval('FREQ=MONTHLY;INTERVAL=6')).toBe(6);
  });

  it('returns 1 when no INTERVAL is present', () => {
    expect(getRecurrenceInterval('FREQ=YEARLY')).toBe(1);
  });
});

describe('getMaterializationHorizon', () => {
  it('returns 2050-12-31 for FREQ=YEARLY', () => {
    expect(getMaterializationHorizon('FREQ=YEARLY')).toBe('2050-12-31');
  });

  it('returns 2050-12-31 for FREQ=MONTHLY;INTERVAL=6', () => {
    expect(getMaterializationHorizon('FREQ=MONTHLY;INTERVAL=6')).toBe(
      '2050-12-31',
    );
  });

  it('returns ~90 days from today for FREQ=DAILY', () => {
    const result = getMaterializationHorizon('FREQ=DAILY');
    const expected = dayjs().add(90, 'day').format('YYYY-MM-DD');
    expect(result).toBe(expected);
  });

  it('returns ~90 days from today for ordinary FREQ=MONTHLY', () => {
    const result = getMaterializationHorizon('FREQ=MONTHLY');
    const expected = dayjs().add(90, 'day').format('YYYY-MM-DD');
    expect(result).toBe(expected);
  });

  it('returns ~90 days from today for FREQ=MONTHLY;INTERVAL=3 (quarterly)', () => {
    const result = getMaterializationHorizon('FREQ=MONTHLY;INTERVAL=3');
    const expected = dayjs().add(90, 'day').format('YYYY-MM-DD');
    expect(result).toBe(expected);
  });
});

describe('expandRRule — Feb 29 leap day', () => {
  it('produces Feb 29 in leap years and Feb 28 in non-leap years with BYMONTHDAY=-1', () => {
    const dates = expandRRule(
      'FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1',
      '2024-02-29',
      '2024-02-29',
      '2029-03-01',
    );
    expect(dates).toEqual([
      '2025-02-28',
      '2026-02-28',
      '2027-02-28',
      '2028-02-29',
      '2029-02-28',
    ]);
  });
});

describe('expandRRule — semi-annual', () => {
  it('expands BYMONTHDAY=15 at 6-month intervals', () => {
    const dates = expandRRule(
      'FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=15',
      '2026-01-15',
      '2026-01-14',
      '2028-01-16',
    );
    expect(dates).toEqual([
      '2026-01-15',
      '2026-07-15',
      '2027-01-15',
      '2027-07-15',
      '2028-01-15',
    ]);
  });

  it('expands BYMONTHDAY=-1 with Aug 31 start', () => {
    const dates = expandRRule(
      'FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=-1',
      '2026-08-31',
      '2026-08-30',
      '2028-08-31',
    );
    expect(dates).toEqual([
      '2026-08-31',
      '2027-02-28',
      '2027-08-31',
      '2028-02-29',
      '2028-08-31',
    ]);
  });

  it('expands BYMONTHDAY=30 with Jun 30 start — produces Dec 30, not Dec 31', () => {
    const dates = expandRRule(
      'FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=30',
      '2026-06-30',
      '2026-06-29',
      '2027-12-31',
    );
    expect(dates).toEqual([
      '2026-06-30',
      '2026-12-30',
      '2027-06-30',
      '2027-12-30',
    ]);
  });
});
