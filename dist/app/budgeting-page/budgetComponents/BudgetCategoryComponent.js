'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const material_1 = require('@mui/material');
const helpers_1 = require('../utils/helpers');
const BudgetCategoryComponent = ({ data }) => {
  const doSomething = () => {
    console.log(`some values: ${JSON.stringify(data)}`);
  };
  return (0, jsx_runtime_1.jsx)(
    material_1.Card,
    {
      children: (0, jsx_runtime_1.jsx)(
        material_1.CardActionArea,
        Object.assign(
          { onClick: () => doSomething() },
          {
            children: (0, jsx_runtime_1.jsxs)(
              material_1.CardContent,
              {
                children: [
                  (0, jsx_runtime_1.jsx)(
                    material_1.Typography,
                    Object.assign(
                      { variant: 'h5', component: 'div' },
                      {
                        children: (0, helpers_1.transformBucketName)(
                          data.bucketname,
                        ),
                      },
                    ),
                    void 0,
                  ),
                  (0, jsx_runtime_1.jsxs)(
                    material_1.Typography,
                    Object.assign(
                      { variant: 'body2', color: 'textSecondary' },
                      {
                        children: [
                          'Category: ',
                          (0, helpers_1.transformCategorytName)(data.category),
                        ],
                      },
                    ),
                    void 0,
                  ),
                  (0, jsx_runtime_1.jsxs)(
                    material_1.Typography,
                    Object.assign(
                      { variant: 'body2', color: 'textSecondary' },
                      { children: ['Amount: $', data.amount] },
                    ),
                    void 0,
                  ),
                  (0, jsx_runtime_1.jsxs)(
                    material_1.Typography,
                    Object.assign(
                      { variant: 'body2', color: 'textSecondary' },
                      { children: ['Household: ', data.household] },
                    ),
                    void 0,
                  ),
                ],
              },
              void 0,
            ),
          },
        ),
        void 0,
      ),
    },
    void 0,
  );
};
exports.default = BudgetCategoryComponent;
