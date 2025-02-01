import request from 'supertest';
import { app, server, db } from '../index';
import {
  budgetAllDataInfo,
  insertData,
} from '../test_data/budgetData';

afterAll(async () => {
  await db.destroy(); // Close the database connection
  server.close(); // Close the server connection
});

describe('POST /budget/expense', () => {
  let idToDelete: string;

  afterAll(async () => {
    if (idToDelete) {
      await db('budget_monthly_expenses').where({ id: idToDelete }).del();
    }
    await db.destroy();
  });

  it('should retrieve all budget data', async () => {
    const response = await request(app).get('/budget/info/all');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(budgetAllDataInfo);
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
