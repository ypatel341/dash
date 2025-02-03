import request from 'supertest';
import { app, server, db } from '../index';
import { budgetAllDataInfo, insertData } from '../test_data/budgetData';
import { insertExpense } from '../utils/db-operation-helpers';
import { InsertExpsenseType, InsertResponseId } from '../utils/types';

afterAll(async () => {
  await db.destroy();
  server.close();
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
    if (idToDelete) {
      await db('budget_monthly_expenses').where({ id: idToDelete }).del();
    }
  });

  it('should insert an expense', async () => {
    const response = await request(app)
      .post('/budget/expense')
      .send(insertData);

    idToDelete = response.body.id;

    expect(response.status).toBe(200);
  });

  it('should return an error if the expense is invalid', async () => {
    const response = await request(app).post('/budget/expense').send({});

    expect(response.status).toBe(400);
  });

  it('should return an error if the amount value is over 10,000', async () => {
    const response = await request(app)
      .post('/budget/expense')
      .send({ ...insertData, amount: 10001 });

    expect(response.body.error).toBe(
      'Invalid requestbody Error: Amount must be greater than 0 or less than 10000',
    );
    expect(response.status).toBe(400);
  });
});

describe('GET /budget/info/allmonthexpense', () => {
  let idToDelete: string;
  let idToDelete2: string;

  beforeAll(async () => {
    const insertedData2 = { ...insertData, description: 'February Rent' };

    const response1: InsertResponseId = await insertExpense(
      insertData as InsertExpsenseType,
    );
    const response2: InsertResponseId = await insertExpense(
      insertedData2 as InsertExpsenseType,
    );

    idToDelete = response1.id;
    idToDelete2 = response2.id;
  });

  afterAll(async () => {
    await db('budget_monthly_expenses').where({ id: idToDelete }).del();
    await db('budget_monthly_expenses').where({ id: idToDelete2 }).del();
  });

  it('should retrieve all monthly expenses', async () => {
    const response = await request(app).get('/budget/info/allmonthexpense');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});
