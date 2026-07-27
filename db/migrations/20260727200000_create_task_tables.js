/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable('task_categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.string('color_key').notNullable();
    table.string('icon_key').nullable();
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });

  await knex.schema.createTable('task_series', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('assigned_to').notNullable();
    table.string('title').notNullable();
    table.text('description').nullable();
    table
      .uuid('category_id')
      .notNullable()
      .references('id')
      .inTable('task_categories');
    table.string('kind').notNullable();
    table.string('modality').notNullable();
    table.string('location').nullable();
    table.string('time_mode').notNullable();
    table.time('start_time').nullable();
    table.time('end_time').nullable();
    table.date('starts_on').notNullable();
    table.date('ends_on').nullable();
    table.text('recurrence_rule').notNullable();
    table.string('status').notNullable().defaultTo('active');
    table.date('generated_through').nullable();
    table.jsonb('metadata').notNullable().defaultTo('{}');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });

  await knex.raw(`
    ALTER TABLE task_series
      ADD CONSTRAINT task_series_kind_check
        CHECK (kind IN ('event', 'deadline', 'activity')),
      ADD CONSTRAINT task_series_modality_check
        CHECK (modality IN ('physical', 'virtual', 'none')),
      ADD CONSTRAINT task_series_time_mode_check
        CHECK (time_mode IN ('timed', 'all_day', 'date_only')),
      ADD CONSTRAINT task_series_status_check
        CHECK (status IN ('active', 'paused', 'ended', 'archived')),
      ADD CONSTRAINT task_series_assigned_to_check
        CHECK (assigned_to IN ('Yogi', 'Riddhi', 'Both'))
  `);

  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('assigned_to').notNullable();
    table
      .uuid('series_id')
      .nullable()
      .references('id')
      .inTable('task_series');
    table.date('original_occurrence_date').nullable();
    table.string('title').notNullable();
    table.text('description').nullable();
    table
      .uuid('category_id')
      .notNullable()
      .references('id')
      .inTable('task_categories');
    table.string('kind').notNullable();
    table.string('modality').notNullable();
    table.string('status').notNullable().defaultTo('planned');
    table.date('task_date').notNullable();
    table.string('time_mode').notNullable();
    table.time('start_time').nullable();
    table.time('end_time').nullable();
    table.string('location').nullable();
    table.boolean('is_exception').notNullable().defaultTo(false);
    table.jsonb('metadata').notNullable().defaultTo('{}');
    table.timestamp('completed_at', { useTz: true }).nullable();
    table.timestamp('canceled_at', { useTz: true }).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });

  await knex.schema.alterTable('tasks', (table) => {
    table.index('task_date');
    table.index(['status', 'task_date']);
    table.index(['assigned_to', 'task_date']);
    table.index('series_id');
  });

  await knex.raw(`
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_kind_check
        CHECK (kind IN ('event', 'deadline', 'activity')),
      ADD CONSTRAINT tasks_modality_check
        CHECK (modality IN ('physical', 'virtual', 'none')),
      ADD CONSTRAINT tasks_status_check
        CHECK (status IN ('planned', 'completed', 'skipped', 'canceled')),
      ADD CONSTRAINT tasks_time_mode_check
        CHECK (time_mode IN ('timed', 'all_day', 'date_only')),
      ADD CONSTRAINT tasks_assigned_to_check
        CHECK (assigned_to IN ('Yogi', 'Riddhi', 'Both')),
      ADD CONSTRAINT tasks_series_occurrence_check
        CHECK (
          (series_id IS NULL AND original_occurrence_date IS NULL)
          OR (series_id IS NOT NULL AND original_occurrence_date IS NOT NULL)
        ),
      ADD CONSTRAINT tasks_exception_check
        CHECK (series_id IS NOT NULL OR is_exception = false)
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX tasks_series_occurrence_unique
      ON tasks (series_id, original_occurrence_date)
      WHERE series_id IS NOT NULL
  `);

  await knex('task_categories').insert([
    { name: 'Work', slug: 'work', color_key: 'primary', sort_order: 1 },
    { name: 'Social', slug: 'social', color_key: 'secondary', sort_order: 2 },
    { name: 'Home', slug: 'home', color_key: 'success', sort_order: 3 },
    { name: 'Finance', slug: 'finance', color_key: 'warning', sort_order: 4 },
    { name: 'Spiritual', slug: 'spiritual', color_key: 'info', sort_order: 5 },
    { name: 'Fitness', slug: 'fitness', color_key: 'error', sort_order: 6 },
    { name: 'Health', slug: 'health', color_key: 'success', sort_order: 7 },
    { name: 'Other', slug: 'other', color_key: 'default', sort_order: 8 },
  ]);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS tasks_series_occurrence_unique');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('task_series');
  await knex.schema.dropTableIfExists('task_categories');
};
