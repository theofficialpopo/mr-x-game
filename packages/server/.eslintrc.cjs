module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  rules: {
    // Warns on console.log usage (use logger instead)
    'no-console': 'warn',
    // Prevents explicit `any` type usage
    '@typescript-eslint/no-explicit-any': 'error',
  },
}
