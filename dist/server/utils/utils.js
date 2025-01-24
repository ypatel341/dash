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
exports.insertExpense = exports.getAllBudgetData = void 0;
const db_1 = __importDefault(require('./db'));
const getAllBudgetData = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const data = yield db_1.default
        .select('*')
        .from('budget_monthly_allocation');
      return data;
    } catch (err) {
      console.error('Error fetching budget data:', err);
      throw err;
    }
  });
exports.getAllBudgetData = getAllBudgetData;
const insertExpense = (expense) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const result = yield (0, db_1.default)('budget_monthly_expenses')
        .insert(expense)
        .returning('id');
      return result[0];
    } catch (err) {
      console.error('Error inserting expense:', err);
      throw err;
    }
  });
exports.insertExpense = insertExpense;
