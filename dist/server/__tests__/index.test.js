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
const supertest_1 = __importDefault(require('supertest'));
const index_1 = require('../index');
const budgetData_1 = require('../test_data/budgetData');
afterAll(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield index_1.db.destroy(); // Close the database connection
  }),
);
describe('GET /budget/needs/electric', () => {
  it('should retrieve rent electric data', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(index_1.app).get(
        '/budget/needs/electric',
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(budgetData_1.electricBudgetData);
    }));
  it('should retrieve rent internet data', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(index_1.app).get(
        '/budget/needs/internet',
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(budgetData_1.internetBudgetData);
    }));
  it('should retrieve rent budget data', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(index_1.app).get(
        '/budget/needs/rent',
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(budgetData_1.rentBudgetData);
    }));
});
describe('GET /budget/info/all', () => {
  it('should retrieve all budget data', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(index_1.app).get(
        '/budget/info/all',
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(budgetData_1.budgetAllDataInfo);
    }));
});
describe('POST /budget/expense', () => {
  let idToDelete;
  afterAll(() =>
    __awaiter(void 0, void 0, void 0, function* () {
      yield (0, index_1.db)('budget_monthly_expenses')
        .where({ id: idToDelete })
        .del();
    }),
  );
  it('should inseert an expense', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(index_1.app)
        .post('/budget/expense')
        .send(budgetData_1.insertData);
      idToDelete = response.body.id;
      expect(response.status).toBe(200);
    }));
});
