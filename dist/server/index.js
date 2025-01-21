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
app.get('/budget/needs/rent', (req, res) => {
    res.json(budgetData_1.rentBudgetData);
});
app.get('/budget/needs/electric', (req, res) => {
    res.json(budgetData_1.electricBudgetData);
});
app.get('/budget/needs/internet', (req, res) => {
    res.json(budgetData_1.internetBudgetData);
});
app.get('/budget/needs/parcel', (req, res) => {
    res.json(budgetData_1.parcelBudgetData);
});
app.get('/budget/needs/groceries', (req, res) => {
    res.json(budgetData_1.groceriesBudgetData);
});
app.get('/budget/needs/gas', (req, res) => {
    res.json(budgetData_1.gasBudgetData);
});
app.get('/budget/needs/therapy', (req, res) => {
    res.json(budgetData_1.therapyBudgetData);
});
app.get('/budget/needs/home-supplies', (req, res) => {
    res.json(budgetData_1.homeSuppliesBudgetData);
});
app.get('/budget/wants/netflix', (req, res) => {
    res.json(budgetData_1.netflixBudgetData);
});
app.get('/budget/wants/spotify', (req, res) => {
    res.json(budgetData_1.spotifyBudgetData);
});
app.get('/budget/wants/date-night', (req, res) => {
    res.json(budgetData_1.dateNightBudgetData);
});
app.get('/budget/wants/vaction', (req, res) => {
    res.json(budgetData_1.vacationBudgetData);
});
app.get('/budget/wants/going-out', (req, res) => {
    res.json(budgetData_1.goingOutBudgetData);
});
app.get('/budget/wants/gifts', (req, res) => {
    res.json(budgetData_1.giftsBudgetData);
});
app.get('/budget/wants/yogi-activities', (req, res) => {
    res.json(budgetData_1.yogiActivitiesBudgetData);
});
app.get('/budget/wants/clothes', (req, res) => {
    res.json(budgetData_1.clothesBudgetData);
});
app.get('/budget/save/savings', (req, res) => {
    res.json(budgetData_1.savingsFundBudgetData);
});
// POST: Create an endpoint that will add a new expense to the allocated bucket in the budget plan
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));
