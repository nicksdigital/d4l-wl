module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
    // This is important for performance
    tsconfigRootDir: __dirname,
    // Cache for better performance
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    // Performance optimizations - disable rules that are slow
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Warn instead of error for better performance
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    // Improve performance by telling ESLint which files to ignore
    'import/ignore': ['node_modules', '.next', 'dist'],
  },
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    'dist',
    'build',
    'public',
    '**/*.d.ts',
    '*.config.js',
    '.eslintrc.js',
  ],
  // Use cache for better performance
  cache: true,
  // Faster cache
  cacheStrategy: 'content',
};
