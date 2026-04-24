import { apicraft } from '@siberiacancode/apicraft';

export default apicraft([
  {
    input: 'api.yaml',
    output: 'generated/api',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tags'
  }
]);
