'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const react_router_dom_1 = require('react-router-dom');
const Button_1 = __importDefault(require('@mui/material/Button'));
const BudgetHomePage_1 = __importDefault(
  require('./budgeting-page/BudgetHomePage'),
);
const HomePage_1 = __importDefault(require('./home-page/HomePage'));
const TasksHomePage_1 = __importDefault(require('./tasks-page/TasksHomePage'));
const EnterExpensePage_1 = require('./budgeting-page/budgetComponents/EnterExpensePage');
const MoneyInMonthPage_1 = require('./budgeting-page/budgetComponents/MoneyInMonthPage');
const NetWorthPage_1 = require('./budgeting-page/budgetComponents/NetWorthPage');
const Outlets_1 = __importDefault(
  require('./budgeting-page/shared-budget-components/Outlets'),
);
require('./App.css');
function App() {
  return (0, jsx_runtime_1.jsx)(
    react_router_dom_1.BrowserRouter,
    {
      children: (0, jsx_runtime_1.jsx)(
        'div',
        Object.assign(
          { className: 'App' },
          {
            children: (0, jsx_runtime_1.jsxs)(
              react_router_dom_1.Routes,
              {
                children: [
                  (0, jsx_runtime_1.jsx)(
                    react_router_dom_1.Route,
                    {
                      path: '/',
                      element: (0, jsx_runtime_1.jsxs)(
                        'header',
                        Object.assign(
                          { className: 'App-header' },
                          {
                            children: [
                              (0, jsx_runtime_1.jsxs)(
                                'p',
                                {
                                  children: [
                                    'Edit ',
                                    (0, jsx_runtime_1.jsx)(
                                      'code',
                                      { children: 'src/App.tsx' },
                                      void 0,
                                    ),
                                    ' and save to reload.',
                                  ],
                                },
                                void 0,
                              ),
                              (0, jsx_runtime_1.jsx)(
                                Button_1.default,
                                Object.assign(
                                  {
                                    variant: 'contained',
                                    color: 'primary',
                                    component: react_router_dom_1.Link,
                                    to: '/budget',
                                  },
                                  { children: 'Budget' },
                                ),
                                void 0,
                              ),
                              (0, jsx_runtime_1.jsx)(
                                Button_1.default,
                                Object.assign(
                                  {
                                    variant: 'contained',
                                    color: 'primary',
                                    component: react_router_dom_1.Link,
                                    to: '/home',
                                  },
                                  { children: 'Home' },
                                ),
                                void 0,
                              ),
                              (0, jsx_runtime_1.jsx)(
                                Button_1.default,
                                Object.assign(
                                  {
                                    variant: 'contained',
                                    color: 'primary',
                                    component: react_router_dom_1.Link,
                                    to: '/tasks',
                                  },
                                  { children: 'Tasks' },
                                ),
                                void 0,
                              ),
                            ],
                          },
                        ),
                        void 0,
                      ),
                    },
                    void 0,
                  ),
                  (0, jsx_runtime_1.jsxs)(
                    react_router_dom_1.Route,
                    Object.assign(
                      {
                        path: '/budget',
                        element: (0, jsx_runtime_1.jsx)(
                          Outlets_1.default,
                          {},
                          void 0,
                        ),
                      },
                      {
                        children: [
                          (0, jsx_runtime_1.jsx)(
                            react_router_dom_1.Route,
                            {
                              index: true,
                              element: (0, jsx_runtime_1.jsx)(
                                BudgetHomePage_1.default,
                                {},
                                void 0,
                              ),
                            },
                            void 0,
                          ),
                          (0, jsx_runtime_1.jsx)(
                            react_router_dom_1.Route,
                            {
                              path: 'net-worth',
                              element: (0, jsx_runtime_1.jsx)(
                                NetWorthPage_1.NetWorthPage,
                                {},
                                void 0,
                              ),
                            },
                            void 0,
                          ),
                          (0, jsx_runtime_1.jsx)(
                            react_router_dom_1.Route,
                            {
                              path: 'money-in-month',
                              element: (0, jsx_runtime_1.jsx)(
                                MoneyInMonthPage_1.MoneyInMonthPage,
                                {},
                                void 0,
                              ),
                            },
                            void 0,
                          ),
                          (0, jsx_runtime_1.jsx)(
                            react_router_dom_1.Route,
                            {
                              path: 'enter-expense',
                              element: (0, jsx_runtime_1.jsx)(
                                EnterExpensePage_1.EnterExpensePage,
                                {},
                                void 0,
                              ),
                            },
                            void 0,
                          ),
                        ],
                      },
                    ),
                    void 0,
                  ),
                  (0, jsx_runtime_1.jsx)(
                    react_router_dom_1.Route,
                    {
                      path: '/home',
                      element: (0, jsx_runtime_1.jsx)(
                        HomePage_1.default,
                        {},
                        void 0,
                      ),
                    },
                    void 0,
                  ),
                  (0, jsx_runtime_1.jsx)(
                    react_router_dom_1.Route,
                    {
                      path: '/tasks',
                      element: (0, jsx_runtime_1.jsx)(
                        TasksHomePage_1.default,
                        {},
                        void 0,
                      ),
                    },
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
}
exports.default = App;
