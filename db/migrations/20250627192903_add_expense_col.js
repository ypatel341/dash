/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('budget_monthly_expenses', function (table) {
    table.uuid('expensable').nullable().unique();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('budget_monthly_expenses', function (table) {
    table.dropUnique('expensable');
    table.dropColumn('expensable');
  });
};
