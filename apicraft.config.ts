import { apicraft } from '@siberiacancode/apicraft';

export default apicraft([
  {
    input: 'http://localhost:3000/api/openapi.json',
    output: 'generated/api',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tags'
  }
]);
