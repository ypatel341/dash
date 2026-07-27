import request from 'supertest';
import { db, server, app } from '../server';
import { getBudgetSummaryService } from '../server/services/budgetService';
import { BudgetSummaryResponse } from '../server/utils/types';

jest.mock('../server/services/budgetService', () => ({
  getBudgetSummaryService: jest.fn(),
}));

afterAll(async () => {
  await db.destroy();
  server.close();
});

afterEach(() => {
  jest.clearAllMocks();
});

const budgetSummary: BudgetSummaryResponse = {
  message: "",
};

describe('GET /budget/summary', () => {
  it('should return the budget summary', async () => {
    (getBudgetSummaryService as jest.Mock).mockResolvedValue(budgetSummary);

    const response = await request(app).get('/budget/summary');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(budgetSummary);
  });

  it('should return a 500 error if the service throws', async () => {
    (getBudgetSummaryService as jest.Mock).mockRejectedValue(
      new Error('Database is down'),
    );

    const response = await request(app).get('/budget/summary');

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Database is down');
  });
});
