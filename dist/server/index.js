'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.db = exports.app = void 0;
const express_1 = __importDefault(require('express'));
const body_parser_1 = __importDefault(require('body-parser'));
const cors_1 = __importDefault(require('cors'));
const budgetData_1 = require('./temp_data/budgetData');
const db_1 = __importDefault(require('./utils/db'));
exports.db = db_1.default;
const utils_1 = require('./utils/utils');
// Initialize express app
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// GET: Create an endpoint that will retrieve a budget plan for a specific allocation
app.get('/budget/info/all', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const data = yield (0, utils_1.getAllBudgetData)();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }),
);
app.get('/budget/needs/rent', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      res.json(budgetData_1.rentBudgetData);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }),
);
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () =>
    console.log(`Server running on port ${port}, http://localhost:${port}`),
  );
}
