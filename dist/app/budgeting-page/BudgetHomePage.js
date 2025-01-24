'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const react_1 = require('react');
const axios_1 = __importDefault(require('axios'));
const material_1 = require('@mui/material');
const BudgetCategoryComponent_1 = __importDefault(
  require('./budgetComponents/BudgetCategoryComponent'),
);
const BudgetSubHeader_1 = __importDefault(
  require('./budgetComponents/BudgetSubHeader'),
);
const BudgetHomePage = () => {
  const [data, setData] = (0, react_1.useState)();
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [error, setError] = (0, react_1.useState)('');
  (0, react_1.useEffect)(() => {
    axios_1.default
      .get('http://localhost:5000/budget/info/all')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return (0, jsx_runtime_1.jsx)('div', { children: 'Loading...' }, void 0);
  }
  if (error) {
    return (0, jsx_runtime_1.jsxs)(
      'div',
      { children: ['Error: with retrieving data', error] },
      void 0,
    );
  }
  if (!data) {
    return (0, jsx_runtime_1.jsx)(
      'div',
      { children: 'Error: Data not found' },
      void 0,
    );
  }
  return (0, jsx_runtime_1.jsxs)(
    material_1.Container,
    {
      children: [
        (0, jsx_runtime_1.jsx)('h1', { children: 'Budget Home Page' }, void 0),
        (0, jsx_runtime_1.jsxs)(
          material_1.Grid,
          Object.assign(
            { container: true, spacing: 3, sx: { mb: 2 } },
            {
              children: [
                (0, jsx_runtime_1.jsxs)(
                  material_1.Grid,
                  Object.assign(
                    { item: true, xs: 12, sm: 4, md: 4 },
                    {
                      children: [
                        (0, jsx_runtime_1.jsx)(
                          BudgetSubHeader_1.default,
                          { title: 'Net Worth' },
                          void 0,
                        ),
                        ' ',
                      ],
                    },
                  ),
                  void 0,
                ),
                (0, jsx_runtime_1.jsx)(
                  material_1.Grid,
                  Object.assign(
                    { item: true, xs: 12, sm: 4, md: 4 },
                    {
                      children: (0, jsx_runtime_1.jsx)(
                        BudgetSubHeader_1.default,
                        { title: 'Money-in Month' },
                        void 0,
                      ),
                    },
                  ),
                  void 0,
                ),
                (0, jsx_runtime_1.jsx)(
                  material_1.Grid,
                  Object.assign(
                    { item: true, xs: 12, sm: 4, md: 4 },
                    {
                      children: (0, jsx_runtime_1.jsx)(
                        BudgetSubHeader_1.default,
                        { title: 'Enter Expense' },
                        void 0,
                      ),
                    },
                  ),
                  void 0,
                ),
              ],
            },
          ),
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          material_1.Grid,
          Object.assign(
            { container: true, spacing: 3 },
            {
              children: data.map((item) =>
                (0, jsx_runtime_1.jsx)(
                  material_1.Grid,
                  Object.assign(
                    { item: true, xs: 12, sm: 6, md: 3 },
                    {
                      children: (0, jsx_runtime_1.jsx)(
                        BudgetCategoryComponent_1.default,
                        { data: item },
                        void 0,
                      ),
                    },
                  ),
                  item.id,
                ),
              ),
            },
          ),
          void 0,
        ),
      ],
    },
    void 0,
  );
};
exports.default = BudgetHomePage;
