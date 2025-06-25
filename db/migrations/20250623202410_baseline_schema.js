/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // DO NOT RUN THIS MIGRATION ON PRODUCTION
  // This migration is for setting up the baseline schema for development/testing purposes only.
  // It creates tables for user roles, users, monthly expenses, and monthly allocation.
  return (
    knex.schema
      // .createTable('users_roles', function (table) {
      //   table.uuid('id').notNullable().primary();
      //   table.string('user_role');
      //   table.timestamp('created_at').defaultTo(knex.fn.now());
      //   table.timestamp('updated_at').nullable.defaultTo(knex.fn.now());
      //   table.timestamp('deleted_at').nullable();
      // })
      // .createTable('user', function (table) {
      //   table.uuid('id').notNullable().primary();
      //   table.string('email');
      //   table.string('first_name');
      //   table.string('last_name');
      //   table.string('role');
      // })
      // .createTable('budget_monthly_expenses', function (table) {
      //   table.uuid('id').notNullable().primary();
      //   table.string('person');
      //   table.string('bucketname');
      //   table.string('vendor');
      //   table.integer('amount');
      //   table.text('description');
      //   table.timestamp('created_at').defaultTo(knex.fn.now());
      //   table.timestamp('updated_at').nullable().defaultTo(knex.fn.now());
      //   table.timestamp('deleted_at').nullable();
      //   table.timestamp('expensedate').notNullable();
      // })
      // .createTable('budget_monthly_allocation', function (table) {
      //   table.uuid('id').notNullable().primary();
      //   table.string('category');
      //   table.string('bucketname');
      //   table.integer('amount');
      //   table.string('household');
      // })
      .createTable('usersTEST', function (table) {
        table.uuid('id').notNullable().primary();
        table.string('email').notNullable().unique();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('role').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').nullable().defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable();
      })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTable('usersTEST');
  // .dropTable('budget_monthly_allocation')
  // .dropTable('budget_monthly_expenses')
  // .dropTable('user')
  // .dropTable('users_roles');
};
