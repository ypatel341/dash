/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Ensure the UUID extension is enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create the reimbursable_expenses table
  return knex.schema.createTable('reimbursable_expenses', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()')); // Auto-generate UUID for id
    table
      .uuid('expensable_id')
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()')); // Auto-generate UUID for expensable_id
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
exports.down = async function (knex) {
  return knex.schema.dropTableIfExists('reimbursable_expenses');
};
