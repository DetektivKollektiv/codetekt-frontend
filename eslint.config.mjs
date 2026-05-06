import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      '.git/**',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
