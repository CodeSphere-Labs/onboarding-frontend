import { reatomRoute } from '@reatom/core';

import { MainLayout } from '@/app/layouts';

import { router } from '.';
import { user } from '../user.model';
import { renderOutlet } from './renderOutlet';

export const rootRoute = reatomRoute(
  {
    layout: true,
    render(self) {
      return <>{renderOutlet(self.outlet())}</>;
    }
  },
  'rootRoute'
);

export const authenticatedRoute = rootRoute.reatomRoute(
  {
    params() {
      if (router.login.match() || router.changePassword.match()) return null;

      const userData = user();

      if (!userData) {
        router.login.go(undefined, true);

        return null;
      }

      if (userData.mustChangePassword) {
        router.changePassword.go(undefined, true);

        return null;
      }

      return { user: userData };
    },

    layout: true,
    render(self) {
      return <MainLayout navigationRoutes={router}>{renderOutlet(self.outlet())}</MainLayout>;
    }
  },
  'authenticatedRoute'
);
