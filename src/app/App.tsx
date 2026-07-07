import { reatomComponent } from '@reatom/react';

import { router } from './router';

export const App = reatomComponent(() => {
  const route = router.root.render();

  return <>{route}</>;
}, 'App');
