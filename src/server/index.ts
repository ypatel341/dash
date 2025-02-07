import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from '../config/db';
import logger from './utils/logger';
import budgetRoutes from './routes/budgetRoutes';

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use('/budget', budgetRoutes);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

export { app, server, db };
