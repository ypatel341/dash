import request from 'supertest';
import { app, db } from '../index';
import {
  rentBudgetData,
  electricBudgetData,
  internetBudgetData,
  budgetAllDataInfo,
  insertData,
} from '../test_data/budgetData';

afterAll(async () => {
  await db.destroy(); // Close the database connection
});

describe('GET /budget/needs/electric', () => {
  it('should retrieve rent electric data', async () => {
    const response = await request(app).get('/budget/needs/electric');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(electricBudgetData);
  });

  it('should retrieve rent internet data', async () => {
    const response = await request(app).get('/budget/needs/internet');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(internetBudgetData);
  });

  it('should retrieve rent budget data', async () => {
    const response = await request(app).get('/budget/needs/rent');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(rentBudgetData);
  });
});

describe('GET /budget/info/all', () => {
  it('should retrieve all budget data', async () => {
    const response = await request(app).get('/budget/info/all');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(budgetAllDataInfo);
  });
});

describe('POST /budget/expense', () => {
  let idToDelete: string;

  afterAll(async () => {
    await db('budget_monthly_expenses').where({ id: idToDelete }).del();
  });

  it('should insert an expense', async () => {
    const response = await request(app)
      .post('/budget/expense')
      .send(insertData);

    idToDelete = response.body.id;

    expect(response.status).toBe(200);
  });

  it('should return an error if the expense is invalid', async () => {
    const response = await request(app)
      .post('/budget/expense')
      .send({});

    expect(response.status).toBe(400);
  });

  it('should return an error if the amount value is over 10,000', async () => {
    const response = await request(app)
      .post('/budget/expense')
      .send({ ...insertData, amount: 10001 });
      
    expect(response.body.error).toBe('Invalid requestbody Error: Amount must be greater than 0 or less than 10000');
    expect(response.status).toBe(400);
  });
});
