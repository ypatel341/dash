import knex from 'knex';
import dotenv from 'dotenv';

// TODO: i feel like there is a better way to handle this file
// but right now im too tired to think of it
// clean this guy up some day :)

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

let connection = {
  connectionString: process.env.DATABASE_URL,
};

const prodConnection = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

if (process.env.NODE_ENV === 'production') {
  connection = prodConnection;
}

const db = knex({
  client: 'pg',
  connection,
});

export default db;
