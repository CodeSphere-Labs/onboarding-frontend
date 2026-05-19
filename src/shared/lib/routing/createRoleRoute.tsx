import type { RouteAtom } from '@reatom/core';

import type { UserRole } from '@/shared/components';

export type { UserRole };

interface RoleRouteParams {
  user?: {
    role?: UserRole;
  };
}

type RoleParentRoute = (() => RoleRouteParams | null) & {
  reatomRoute: RouteAtom<string, any, any, any, any, any>['reatomRoute'];
};

interface CreateRoleRouteOptions {
  allowedRoles: readonly UserRole[];
  fallbackRoute?: { go: () => unknown };
  name: string;
  parentRoute: RoleParentRoute;
}

export const createRoleRoute = ({
  allowedRoles,
  fallbackRoute,
  name,
  parentRoute
}: CreateRoleRouteOptions) =>
  parentRoute.reatomRoute(
    {
      params() {
        const parentParams = parentRoute();

        if (!parentParams) return null;

        const userRole = parentParams.user?.role;
        const hasAccess = userRole ? allowedRoles.includes(userRole) : false;

        if (!hasAccess) {
          fallbackRoute?.go();

          return null;
        }

        return parentParams;
      },

      render: (self) => <>{self.outlet()}</>
    },
    name
  );
