# Personal Scripts and hacks (DASH)

1) Create a prod snapshot by running `prod-snapshot-script.sh`
   1) If this doesnt work, might need to check to see if the prod tables are set correctly in the respective paths
   2) this will create a new snapshot in the `dbdumps` folder
2) To restore run `restore-from-backup.sh`
   1) Will need to take the snapshot first as this is dependent on the day
3) KNEX
   1) The original baseline_schema should not be run in production only because the tables were created first the purpose of the baseline_schema is for a new developer or machine
   2) preferably run the steps above to get a snapshot of some sorts
   3) run `npm run start` and should trigger the knex tables after
   4) run `knex:migrate:make --stub` for a new knex migration
   5) use this script to test connections to knex ```const knex = require('knex')(require('./knexfile').development);

knex
  .raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
```