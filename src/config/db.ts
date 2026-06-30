import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

// Load environment-specific .env file
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: envFile });

interface DatabaseConfig {
  development: Knex.Config;
  production: Knex.Config;
}

const databaseConfig: DatabaseConfig = {
  development: {
    client: 'postgresql',
    connection:
      process.env.DATABASE_URL ||
      'postgres://postgres:@localhost:5432/dash-test',
    pool: {
      min: 0,
      max: 5,
      idleTimeoutMillis: 30000,
    },
    // debug: true, // Enable debug mode for development
  },

  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
    acquireConnectionTimeout: 60000,
  },
};

const environment =
  (process.env.NODE_ENV as keyof DatabaseConfig) || 'development';
const config = databaseConfig[environment];

if (environment === 'production' && !process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const db = knex(config);

console.log(`🗄️  Database configured for ${environment} environment`);

export default db;
