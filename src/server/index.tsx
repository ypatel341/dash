// const express = require('express');
// const cors = require('cors');
// const app = express();
// app.use(cors());
// app.get('/', (req, res) => res.send('Home Route'));
// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));

const express = require('express');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
    },
});
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// CORS implemented so that we don't get errors when trying to access the server from a different server location
app.use(cors());
// GET: Fetch all movies from the database
app.get('/users', (req, res) => {
    db.select('*')
        .from('users')
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
        });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));