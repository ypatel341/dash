import express from 'express';
import path from 'path';
import db from '../config/db';
import logger from "./utils/logger";
import budgetRoutes from './routes/budgetRoutes';

const app = express();

app.use(express.json());

app.use('/api', budgetRoutes);

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '../../dist')));

// Fallback for single-page apps:
app.get('*', (req: any, res: { sendFile: (arg0: any) => void; }) => {
  logger.info(`req ${req}`);
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

export { app, server, db };