require('dotenv').config(); // This will work with dotenv-cli

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'postgresql',
    connection: 'postgres://postgres:@localhost:5432/dash-test', // TODO: remove hardcoded
    pool: {
      min: 0, // Minimum number of connections
      max: 5, // Maximum number of connections
      idleTimeoutMillis: 30000, // Destroy idle connections after 30 seconds
    },
    migrations: {
      directory: './db/migrations', // Directory for migration files
    },
    seeds: {
      directory: './db/seeds', // Directory for seed files (optional)
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST, // Host for production database
      database: process.env.DB_NAME, // Database name
      user: process.env.DB_USER, // Database user
      password: process.env.DB_PASSWORD, // Database password
      port: process.env.DB_PORT || 5432, // Default PostgreSQL port
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2, // Minimum number of connections
      max: 10, // Maximum number of connections
      idleTimeoutMillis: 30000, // Destroy idle connections after 30 seconds
    },
    migrations: {
      tableName: 'knex_migrations', // Table to track migrations
      directory: './db/migrations', // Directory for migration files
    },
    seeds: {
      directory: './db/seeds', // Directory for seed files (optional)
    },
  },
};
