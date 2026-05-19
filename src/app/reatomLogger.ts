import { connectLogger } from '@reatom/core';

if (import.meta.env.DEV) {
  connectLogger({
    match: (name) => {
      if (name.includes('Route')) return 'cyan';
      if (name.includes('urlAtom')) return 'orange';
      if (name.includes('user')) return 'green';

      return false;
    }
  });
}
