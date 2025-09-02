/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // in the reimbursable_expenses table, change the column name from reimbursable to reimbursed
  return knex.schema.table('reimbursable_expenses', function (table) {
    table.renameColumn('reimbursable', 'reimbursed');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // in the reimbursable_expenses table, change the column name from reimbursed back to reimbursable
  return knex.schema.table('reimbursable_expenses', function (table) {
    table.renameColumn('reimbursed', 'reimbursable');
  });
};
