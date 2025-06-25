import {
  createAggregatedMonthlyReport,
  createMonthlyExpenseWithTimestamps,
} from '../server/utils/data-factory/testDataFactory';
import { AggregatedMonthlyReport } from '../server/utils/types';
import { roundToCurrency } from '../server/utils/utils';

describe('roundToCurrency', () => {
  it('should round monthly expense totals and bucket allocations to two decimal places', () => {
    const report: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      groceries: {
        monthlyExpenseTotal: 123.456,
        monthlyBucketAllocation: 300.789,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'groceries',
            amount: 123.456,
          }),
        ],
      },
      utilities: {
        monthlyExpenseTotal: 99.999,
        monthlyBucketAllocation: 150.123,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'utilities',
            amount: 99.999,
          }),
        ],
      },
    });

    const expected: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      groceries: {
        monthlyExpenseTotal: 123.46,
        monthlyBucketAllocation: 300.79,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'groceries',
            amount: 123.456,
          }),
        ],
      },
      utilities: {
        monthlyExpenseTotal: 100.0,
        monthlyBucketAllocation: 150.12,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'utilities',
            amount: 99.999,
          }),
        ],
      },
    });

    const result = roundToCurrency(report);
    expect(result).toEqual(expected);
  });

  it('should handle empty buckets object', () => {
    const report: AggregatedMonthlyReport = { buckets: {} };
    const expected: AggregatedMonthlyReport = { buckets: {} };

    const result = roundToCurrency(report);
    expect(result).toEqual(expected);
  });

  it('should handle values already rounded to two decimal places', () => {
    const report: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      rent: {
        monthlyExpenseTotal: 1500.0,
        monthlyBucketAllocation: 2000.0,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'rent',
            amount: 1500,
          }),
        ],
      },
    });

    const expected: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      rent: {
        monthlyExpenseTotal: 1500.0,
        monthlyBucketAllocation: 2000.0,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'rent',
            amount: 1500,
          }),
        ],
      },
    });

    const result = roundToCurrency(report);
    expect(result).toEqual(expected);
  });

  it('should handle zero values', () => {
    const report: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      entertainment: {
        monthlyExpenseTotal: 0.0,
        monthlyBucketAllocation: 0.0,
        monthlyExpenses: [],
      },
    });

    const expected: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      entertainment: {
        monthlyExpenseTotal: 0.0,
        monthlyBucketAllocation: 0.0,
        monthlyExpenses: [],
      },
    });

    const result = roundToCurrency(report);
    expect(result).toEqual(expected);
  });

  it('should handle values with many decimal places', () => {
    const report: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      shopping: {
        monthlyExpenseTotal: 33.333333333,
        monthlyBucketAllocation: 66.666666666,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'shopping',
            amount: 33.333333333,
          }),
        ],
      },
    });

    const expected: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      shopping: {
        monthlyExpenseTotal: 33.33,
        monthlyBucketAllocation: 66.67,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'shopping',
            amount: 33.333333333,
          }),
        ],
      },
    });

    const result = roundToCurrency(report);
    expect(result).toEqual(expected);
  });

  it('should handle single bucket with rounding', () => {
    const report: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      healthcare: {
        monthlyExpenseTotal: 75.555,
        monthlyBucketAllocation: 100.777,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'healthcare',
            amount: 75.555,
          }),
        ],
      },
    });

    const expected: AggregatedMonthlyReport = createAggregatedMonthlyReport({
      healthcare: {
        monthlyExpenseTotal: 75.56,
        monthlyBucketAllocation: 100.78,
        monthlyExpenses: [
          createMonthlyExpenseWithTimestamps({
            bucketname: 'healthcare',
            amount: 75.555,
          }),
        ],
      },
    });

    const result = roundToCurrency(report);
    expect(result).toEqual(expected);
  });
});
