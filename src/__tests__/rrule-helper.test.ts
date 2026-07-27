import { validateRRule, expandRRule } from '../server/utils/rruleHelper';

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
