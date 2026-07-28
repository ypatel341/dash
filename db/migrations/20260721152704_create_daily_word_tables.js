/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('daily_words', (table) => {
    table.bigIncrements('id').primary();

    table.string('wordnik_id', 64).notNullable().unique();
    table.string('word', 255).notNullable();

    table.date('display_date').notNullable().unique();
    table.timestamp('publish_date', { useTz: true }).notNullable();

    table.string('provider_name', 100).notNullable();
    table.integer('provider_id').nullable();

    table.text('note').nullable();
    table.text('html_extra').nullable();

    table.jsonb('raw_payload').notNullable();

    table
      .timestamp('fetched_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index('word');
  });

  await knex.schema.createTable('daily_word_definitions', (table) => {
    table.bigIncrements('id').primary();

    table
      .bigInteger('daily_word_id')
      .notNullable()
      .references('id')
      .inTable('daily_words')
      .onDelete('CASCADE');

    table.text('definition').notNullable();
    table.string('part_of_speech', 100).nullable();
    table.string('source', 100).nullable();
    table.text('note').nullable();

    table.integer('display_order').notNullable();

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.unique(['daily_word_id', 'display_order']);
    table.index('daily_word_id');
    table.index('part_of_speech');
  });

  await knex.schema.createTable('daily_word_examples', (table) => {
    table.bigIncrements('id').primary();

    table
      .bigInteger('daily_word_id')
      .notNullable()
      .references('id')
      .inTable('daily_words')
      .onDelete('CASCADE');

    table.bigInteger('wordnik_example_id').nullable();
    table.text('example_text').notNullable();
    table.text('title').nullable();
    table.text('source_url').nullable();

    table.integer('display_order').notNullable();

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.unique(['daily_word_id', 'display_order']);
    table.index('daily_word_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('daily_word_examples');
  await knex.schema.dropTableIfExists('daily_word_definitions');
  await knex.schema.dropTableIfExists('daily_words');
};
