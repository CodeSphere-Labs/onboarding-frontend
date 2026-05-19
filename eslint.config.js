import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true,
    react: true,
    ignores: ['generated/**']
  },
  {
    rules: {
      'unused-imports/no-unused-imports': 'error'
    }
  }
);
