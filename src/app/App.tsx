import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import BudgetHomePage from './budgeting-page/BudgetHomePage';
import HomePage from './home-page/HomePage';
import TasksHomePage from './tasks-page/TasksHomePage';
import { EnterExpensePage } from './budgeting-page/budget-components/ExpenseComponents/EnterExpensePage';
import { MoneyInMonthPage } from './budgeting-page/budget-components/MoneyInMonthPage';
import { NetWorthPage } from './budgeting-page/budget-components/NetWorthPage';

import BudgetOutlet from './budgeting-page/shared-budget-components/Outlets';

import './App.css';
import ExpenseDetailsHomePage from './budgeting-page/budget-components/ExpenseDetailsComponents/ExpenseDetailsHomePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <header className="App-header">
                <p>
                  Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/budget"
                >
                  Budget
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/home"
                >
                  Home
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/tasks"
                >
                  Tasks
                </Button>
              </header>
            }
          />
          <Route path="/budget" element={<BudgetOutlet />}>
            <Route index element={<BudgetHomePage />} />
            <Route path="net-worth" element={<NetWorthPage />} />
            <Route path="money-in-month" element={<MoneyInMonthPage />} />
            <Route path="enter-expense" element={<EnterExpensePage />} />
            <Route
              path="details/:YYYYMM/:bucketname"
              element={<ExpenseDetailsHomePage />}
            />
          </Route>
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TasksHomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
