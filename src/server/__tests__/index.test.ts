import request from 'supertest';
import { app } from '../index';
import { rentBudgetData } from '../temp_data/budgetData';

describe('GET /budget/needs/rent', () => {
  it('should retrieve rent budget data', async () => {
    const response = await request(app).get('/budget/needs/rent');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(rentBudgetData);
  });
});
