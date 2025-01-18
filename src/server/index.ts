import express from 'express';
import knex from 'knex';
import bodyParser from 'body-parser';
import cors from 'cors';
import { budgetData } from './temp_data/budgetData';

require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize knex for database connectio
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
    },
});

// GET: Fetch all users from the database
app.get('/users', (req, res) => {
    db.select('*')
        .from('users')
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
        });
});

// GET: Create an endpoint that will retrieve a budget plan for a specific allocation
app.get('/budget/clothes', (req, res) => {
    console.log('comes here');
    res.json(budgetData);
});

// POST: Create an endpoint that will add a new expense to the allocated bucket in the budget plan

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));