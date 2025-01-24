'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const material_1 = require('@mui/material');
const react_router_dom_1 = require('react-router-dom');
const BudgetCategoryTypes_1 = require('../types/BudgetCategoryTypes');
const BudgetSubHeader = ({ title }) => {
  const nvaigate = (0, react_router_dom_1.useNavigate)();
  const navigateTo = () => {
    const route = BudgetCategoryTypes_1.SubHeaderRoutes[title];
    if (route) {
      nvaigate(route);
    } else {
      {
        /*TODO: IMPLEMENT AN ERROR PAGE HERE */
      }
      console.error('Route not found');
    }
  };
  return (0, jsx_runtime_1.jsx)(
    material_1.Card,
    {
      children: (0, jsx_runtime_1.jsx)(
        material_1.CardActionArea,
        Object.assign(
          { onClick: () => navigateTo() },
          {
            children: (0, jsx_runtime_1.jsx)(
              material_1.CardContent,
              {
                children: (0, jsx_runtime_1.jsx)(
                  material_1.Typography,
                  Object.assign(
                    { variant: 'h6', component: 'div' },
                    { children: title },
                  ),
                  void 0,
                ),
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
exports.default = BudgetSubHeader;
