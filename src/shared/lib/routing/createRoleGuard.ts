import type { UserRole } from '@/shared/components';

export type { UserRole };

interface RoleRouteParams {
  user?: {
    role?: UserRole;
  };
}

interface CreateRoleGuardOptions<Params extends RoleRouteParams> {
  allowedRoles: readonly UserRole[];
  onDenied?: () => void;
  parentRoute: () => Params | null | undefined;
}

/**
 * Возвращает `params`-функцию для ролевого layout-роута: роут матчится, только
 * если роль пользователя входит в `allowedRoles`, иначе вызывается `onDenied`
 * (редирект на fallback) и матч снимается.
 */
export const createRoleGuard =
  <Params extends RoleRouteParams>({
    allowedRoles,
    onDenied,
    parentRoute
  }: CreateRoleGuardOptions<Params>) =>
  () => {
    const parentParams = parentRoute();

    if (!parentParams) return null;

    const userRole = parentParams.user?.role;

    const hasAccess = userRole ? allowedRoles.includes(userRole) : false;

    if (!hasAccess) {
      onDenied?.();

      return null;
    }

    return {};
  };
