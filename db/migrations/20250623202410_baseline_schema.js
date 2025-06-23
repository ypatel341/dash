/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('usersTEST', function(table){
        table.uuid('id').notNullable().primary();
        table.string('first_name');
        table.string('last_name');
        table.string('email');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('usersTEST');
};
