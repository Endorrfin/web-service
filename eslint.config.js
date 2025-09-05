const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-unused-vars': ['error', {
        'vars': 'all',
        'args': 'after-used',
        'caughtErrors': 'none',
        'ignoreRestSiblings': false,
        'argsIgnorePattern': '^_', // Allow unused variables that start with underscore
        'varsIgnorePattern': '^_'  // Allow unused variables that start with underscore
      }],
      'prefer-const': 'error',
      'no-var': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never']
    }
  }
];

