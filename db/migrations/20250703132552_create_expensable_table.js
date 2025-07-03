/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('reimbursable_expenses', function(table) {
    table.uuid('id').primary();
    table.uuid('expensable_id').references('expensable').inTable('budget_monthly_expenses').onDelete('CASCADE');
    table.string('company').notNullable();
    table.boolean('reimbursable').notNullable().defaultTo(false);
    table.string('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('deleted_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('reimbursable_expenses');
};
