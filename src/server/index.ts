import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
  clothesBudgetData,
  dateNightBudgetData,
  electricBudgetData,
  gasBudgetData,
  giftsBudgetData,
  goingOutBudgetData,
  groceriesBudgetData,
  homeSuppliesBudgetData,
  internetBudgetData,
  netflixBudgetData,
  parcelBudgetData,
  rentBudgetData,
  savingsFundBudgetData,
  spotifyBudgetData,
  therapyBudgetData,
  vacationBudgetData,
  yogiActivitiesBudgetData,
} from './temp_data/budgetData';
import db from './utils/db';
import { getAllBudgetData } from './utils/utils';

import { BudgetType } from './utils/utils';

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// GET: Create an endpoint that will retrieve a budget plan for a specific allocation
app.get('/budget/info/all', async (req, res) => {
  try {
    const data: BudgetType[] = await getAllBudgetData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/budget/needs/rent', async (req, res) => {
  try {
    res.json(rentBudgetData);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/budget/needs/electric', (req, res) => {
  res.json(electricBudgetData);
});

app.get('/budget/needs/internet', (req, res) => {
  res.json(internetBudgetData);
});

app.get('/budget/needs/parcel', (req, res) => {
  res.json(parcelBudgetData);
});

app.get('/budget/needs/groceries', (req, res) => {
  res.json(groceriesBudgetData);
});

app.get('/budget/needs/gas', (req, res) => {
  res.json(gasBudgetData);
});

app.get('/budget/needs/therapy', (req, res) => {
  res.json(therapyBudgetData);
});

app.get('/budget/needs/home-supplies', (req, res) => {
  res.json(homeSuppliesBudgetData);
});

app.get('/budget/wants/netflix', (req, res) => {
  res.json(netflixBudgetData);
});

app.get('/budget/wants/spotify', (req, res) => {
  res.json(spotifyBudgetData);
});

app.get('/budget/wants/date-night', (req, res) => {
  res.json(dateNightBudgetData);
});

app.get('/budget/wants/vaction', (req, res) => {
  res.json(vacationBudgetData);
});

app.get('/budget/wants/going-out', (req, res) => {
  res.json(goingOutBudgetData);
});

app.get('/budget/wants/gifts', (req, res) => {
  res.json(giftsBudgetData);
});

app.get('/budget/wants/yogi-activities', (req, res) => {
  res.json(yogiActivitiesBudgetData);
});

app.get('/budget/wants/clothes', (req, res) => {
  res.json(clothesBudgetData);
});

app.get('/budget/save/savings', (req, res) => {
  res.json(savingsFundBudgetData);
});

// POST: Create an endpoint that will add a new expense to the allocated bucket in the budget plan
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () =>
    console.log(`Server running on port ${port}, http://localhost:${port}`),
  );
}

export { app, db };
