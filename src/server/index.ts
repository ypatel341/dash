import express from 'express';
import path from 'path';
import db from '../config/db';
import cors from 'cors';
import logger from './utils/logger';
import budgetRoutes from './routes/budgetRoutes';
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

// let memoryHistory: any[] = [];

// setInterval(() => {
//     const usage = process.memoryUsage();
//     const rss = (usage.rss / 1024 / 1024).toFixed(2);
//     const heapUsed = (usage.heapUsed / 1024 / 1024).toFixed(2);

//     memoryHistory.push({ rss, heapUsed });
//     console.log(`Memory Usage: RSS=${rss}MB HeapUsed=${heapUsed}MB`);

//     // If memory history exceeds 10 logs, compare old vs new
//     if (memoryHistory.length > 10) {
//         const first = memoryHistory[0];
//         const last = memoryHistory[memoryHistory.length - 1];

//         console.log(`Memory Change: RSS=${(last.rss - first.rss).toFixed(2)}MB HeapUsed=${(last.heapUsed - first.heapUsed).toFixed(2)}MB`);

//         // If RSS has grown by more than 50MB and keeps rising, it's a likely leak
//         if (last.rss - first.rss > 50) {
//             console.warn('⚠️ Potential Memory Leak Detected! RSS growing continuously.');
//         }

//         // Keep the last 10 logs
//         memoryHistory = memoryHistory.slice(-10);
//     }
// }, 5000);

// Disable clustering in test environment
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  app = express();

  // Enable CORS for all routes
  app.use(cors());

  app.use(compression());

  // Enable JSON body parsing
  app.use(express.json());

  // Enable URL-encoded body parsing
  app.use('/budget', budgetRoutes);

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

  // Enable URL-encoded body parsing
  app.use('/budget', budgetRoutes);

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
