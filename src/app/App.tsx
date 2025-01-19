import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import BudgetHomePage from './budgeting-page/BudgetHomePage';
import HomePage from './home-page/HomePage';
import TasksHomePage from './tasks-page/TasksHomePage'

import './App.css';

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
          <Route path="/budget" element={<BudgetHomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TasksHomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
