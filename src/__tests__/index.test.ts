import request from 'supertest';
import { db, server, app } from '../server';
import {
  getAllBudgetData,
  insertExpense,
  getAllMonthlyExpense,
} from '../server/utils/db-operation-helpers';
import {
  BudgetType,
  InsertResponseId,
  InsertExpenseType,
  MonthlyExpense,
} from '../server/utils/types';
import { calculateBucketExpenses } from '../server/utils/utils';
import { budgetAllDataInfo, insertData } from '../test_data/budgetData';

afterAll(async () => {
  await db.destroy();
  server.close();
});

describe('getAllBudgetData', () => {
  it('should retrieve all budget data', async () => {
    const allBudgetData: BudgetType[] = await getAllBudgetData();
    expect(allBudgetData).toEqual(budgetAllDataInfo);
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
      'Invalid request body Error: Amount must be greater than 0 or less than 10000',
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
      insertData as InsertExpenseType,
    );
    const response2: InsertResponseId = await insertExpense(
      insertedData2 as InsertExpenseType,
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
    const responsefromDB = await getAllMonthlyExpense();

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(responsefromDB.length);
  });
});

describe('GET /budget/info/allbucketexpense', () => {
  it('should retrieve all bucket expenses', async () => {
    const rawMonthlyData: MonthlyExpense[] = await getAllMonthlyExpense();
    const allBudgetData: BudgetType[] = await getAllBudgetData();
    await calculateBucketExpenses(rawMonthlyData, allBudgetData);
  });
});

describe('GET /budget/info/bucketexpense', () => {
  it('should return all expenses for the month provided', async () => {
    const response = await request(app).get(
      '/budget/info/bucketexpense/rent/?YYYYMM=2025-04',
    );

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should throw an error if the date is invalid', async () => {
    const response = await request(app).get(
      '/budget/info/bucketexpense/rent/?YYYYMM=invalid-date',
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid month format. Expected YYYY-MM');
  });

  it('should return an error if the bucket name is invalid', async () => {
    const response = await request(app).get(
      '/budget/info/bucketexpense/invalid-bucket/?YYYYMM=2025-04',
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid bucketname invalid-bucket');
  });

  // describe('GET /budget/info/generateMonthlyReportController', () => {
  //   it('should generate a monthly report', async () => {
  //     const response = await request(app).get(
  //       '/budget/reports/generateMonthlyReport/2025-04',
  //     );

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //   });
  // });
});
