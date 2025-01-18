"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const knex_1 = __importDefault(require("knex"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const budgetData_1 = require("./temp_data/budgetData");
require('dotenv').config();
// Initialize express app
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// Initialize knex for database connectio
const db = (0, knex_1.default)({
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
    res.json(budgetData_1.budgetData);
});
// POST: Create an endpoint that will add a new expense to the allocated bucket in the budget plan
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));
