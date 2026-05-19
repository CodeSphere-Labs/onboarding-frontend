import { reatomComponent } from '@reatom/react';

import { rootRoute } from './routes';

export const App = reatomComponent(() => {
  const route = rootRoute.render();

  return <>{route}</>;
}, 'App');
