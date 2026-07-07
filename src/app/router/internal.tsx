import { reatomRoute } from '@reatom/core';

import { MainLayout } from '@/app/layouts';

import { router } from '.';
import { user } from '../user.model';

export const rootRoute = reatomRoute(
  {
    layout: true,
    render(self) {
      return <>{self.outlet()}</>;
    }
  },
  'rootRoute'
);

export const authenticatedRoute = rootRoute.reatomRoute(
  {
    params() {
      if (router.login.match()) return null;

      const userData = user();

      if (!userData) {
        router.login.go(undefined, true);

        return null;
      }

      return { user: userData };
    },

    layout: true,
    render(self) {
      return <MainLayout navigationRoutes={router}>{self.outlet()}</MainLayout>;
    }
  },
  'authenticatedRoute'
);
