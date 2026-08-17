import express from 'express';
import path from 'path';
import db from '../config/db';
import cors from 'cors';
import logger from './utils/logger';
import budgetRoutes from './routes/budgetRoutes';
import dailyWordRoutes from './routes/dailyWordRoutes';
import taskRoutes from './routes/taskRoutes';
import compression from 'compression';
import cluster from 'node:cluster';
import process from 'node:process';

const numbOfWorkers =
  parseInt(process.env.HEROKU_AVAILABLE_PARALLELISM || '1', 10) ||
  parseInt(process.env.WEB_CONCURRENCY || '1', 10) ||
  1;

const port = process.env.PORT || 5000;
let app: express.Application;
let server: any;

const healthCheckHandler = async (
  _req: express.Request,
  res: express.Response,
) => {
  try {
    await db.raw('select 1');
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  } catch (error) {
    logger.error(`Health check failed: ${error}`);
    res.status(503).json({ status: 'error', uptime: process.uptime() });
  }
};

// Disable clustering in test environment
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  app = express();

  // Enable CORS for all routes
  app.use(cors());

  app.use(compression());

  // Enable JSON body parsing
  app.use(express.json());

  // Enable URL-encoded body parsing
  app.use('/api/budget', budgetRoutes);
  app.use('/api/daily-word', dailyWordRoutes);
  app.use('/api/tasks', taskRoutes);

  // Health check for uptime monitoring
  app.get('/health', healthCheckHandler);

  // Serve static files from the dist folder
  app.use(express.static(path.join(__dirname, '../../dist')));

  // Fallback for single-page apps:
  app.get('*', (req: any, res: { sendFile: (arg0: any) => void }) => {
    logger.info(`req ${req}`);
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });

  server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
} else if (cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);

  // Fork workers based on the number of available CPUs or environment variables
  for (let i = 0; i < numbOfWorkers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.info(
      `Worker ${worker.process.pid} died code: ${code}, signal: ${signal}`,
    );
  });
} else {
  app = express();

  // Enable CORS for all routes
  app.use(cors());

  app.use(compression());

  // Enable JSON body parsing
  app.use(express.json());

  // Mount API routes
  app.use('/api/budget', budgetRoutes);
  app.use('/api/daily-word', dailyWordRoutes);
  app.use('/api/tasks', taskRoutes);

  // Health check for uptime monitoring
  app.get('/health', healthCheckHandler);

  // Serve static files from the dist folder
  app.use(express.static(path.join(__dirname, '../../dist')));

  // Fallback for single-page apps:
  app.get('*', (req: any, res: { sendFile: (arg0: any) => void }) => {
    logger.info(`req ${req}`);
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });

  server = app.listen(port, () => {
    logger.info(`Worker ${process.pid} started and listening on port ${port}`);
  });
}

// Export app, server, and db for testing
export { app, server, db };
