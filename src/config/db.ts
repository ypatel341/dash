import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

interface DatabaseConfig {
  development: Knex.Config;
  production: Knex.Config;
}

const databaseConfig: DatabaseConfig = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || 'postgres://postgres:@localhost:5432/dash-test',
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
      host: process.env.DB_HOST!,
      database: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      port: parseInt(process.env.DB_PORT || '5432'),
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

const environment = (process.env.NODE_ENV as keyof DatabaseConfig) || 'development';
const config = databaseConfig[environment];

if (environment === 'production') {
  const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

const db = knex(config);

console.log(`🗄️  Database configured for ${environment} environment`);

export default db;
