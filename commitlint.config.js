module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0, 'never'], // Disable subject case rule
    'subject-empty': [0, 'never'], // Disable subject empty rule
    'type-case': [0, 'never'], // Disable type case rule
    'type-empty': [0, 'never'], // Disable type empty rule
    'type-enum': [0, 'always', []], // Disable type enum rule
    'header-max-length': [0, 'always', 72], // Disable header max length rule
  },
};
