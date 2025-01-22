import request from 'supertest';
import { app } from '../index';
import { rentBudgetData, electricBudgetData } from '../temp_data/budgetData';

describe('GET /budget/needs/rent', () => {
  it('should retrieve rent budget data', async () => {
    const response = await request(app).get('/budget/needs/rent');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(rentBudgetData);
  });
});

describe('GET /budget/needs/electric', () => {
    it('should retrieve rent electric data', async () => {
      const response = await request(app).get('/budget/needs/electric');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(electricBudgetData);
    });
  });
  