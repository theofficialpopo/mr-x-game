module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Catches missing dependencies in useEffect, useMemo, useCallback
    'react-hooks/exhaustive-deps': 'error',
    // Warns on console.log usage (use logger instead)
    'no-console': 'warn',
    // Prevents explicit `any` type usage
    '@typescript-eslint/no-explicit-any': 'error',
  },
}
