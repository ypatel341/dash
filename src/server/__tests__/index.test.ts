import request from 'supertest';
import { app, db } from '../index';
import {
  rentBudgetData,
  electricBudgetData,
  internetBudgetData,
} from '../temp_data/budgetData';

afterAll(async () => {
    await db.destroy(); // Close the database connection
  });

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

describe('GET /budget/needs/internet', () => {
  it('should retrieve rent internet data', async () => {
    const response = await request(app).get('/budget/needs/internet');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(internetBudgetData);
  });
});
