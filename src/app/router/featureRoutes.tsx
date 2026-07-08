import type { UserRole } from '@/shared/lib/routing';

import {
  Achievements,
  Analytics,
  Candidates,
  ChangePassword,
  Dashboard,
  Employees,
  Feedback,
  Goals,
  Login,
  Onboardings,
  Plan,
  PlanPrint,
  Settings,
  Templates,
  Users,
  WelcomePackage
} from '@/pages';
import { createRoleGuard } from '@/shared/lib/routing';

import { router } from '.';
import { user } from '../user.model';
import { authenticatedRoute, rootRoute } from './internal';

export const loginRoute = rootRoute.reatomRoute(
  {
    path: 'login',
    params() {
      const userData = user();

      if (userData) {
        if (userData.mustChangePassword) router.changePassword.go(undefined, true);
        else router.dashboard.go(undefined, true);

        return null;
      }

      return {};
    },
    render: () => <Login />
  },
  'loginRoute'
);

export const changePasswordRoute = rootRoute.reatomRoute(
  {
    path: 'change-password',
    params() {
      const userData = user();

      if (!userData) {
        router.login.go(undefined, true);

        return null;
      }

      if (userData.mustChangePassword !== true) {
        router.dashboard.go(undefined, true);

        return null;
      }

      return {};
    },
    render: () => <ChangePassword />
  },
  'changePasswordRoute'
);

/** Печатная версия плана — вне MainLayout (см. исключение в authenticatedRoute) */
export const planPrintRoute = rootRoute.reatomRoute(
  {
    path: 'plan/print',
    params() {
      const userData = user();

      if (!userData) {
        router.login.go(undefined, true);

        return null;
      }

      if (userData.mustChangePassword) {
        router.changePassword.go(undefined, true);

        return null;
      }

      if (userData.role === 'recruiter') {
        router.dashboard.go(undefined, true);

        return null;
      }

      return {};
    },
    render: () => <PlanPrint />
  },
  'planPrintRoute'
);

export const dashboardRoute = authenticatedRoute.reatomRoute(
  {
    path: '',
    render: () => <Dashboard />
  },
  'dashboardRoute'
);

/**
 * Ролевой гейт вешается только на роуты с конкретным path: у pathless
 * layout-роутов params() выполняется на КАЖДОЙ навигации под родителем,
 * и onDenied-редирект гонялся бы с целевой навигацией (см. OSS-26).
 * У роутов с path params() вызывается только при совпадении URL.
 */
const roleGuard = (allowedRoles: readonly UserRole[]) =>
  createRoleGuard({
    allowedRoles,
    onDenied: () => {
      router.dashboard.go(undefined, true);
    },
    parentRoute: authenticatedRoute
  });

export const onboardingsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'onboardings',
    params: roleGuard(['hr']),
    render: () => <Onboardings />
  },
  'onboardingsRoute'
);

export const templatesRoute = authenticatedRoute.reatomRoute(
  {
    path: 'templates',
    params: roleGuard(['hr']),
    render: () => <Templates />
  },
  'templatesRoute'
);

export const usersRoute = authenticatedRoute.reatomRoute(
  {
    path: 'users',
    params: roleGuard(['hr']),
    render: () => <Users />
  },
  'usersRoute'
);

export const employeesRoute = authenticatedRoute.reatomRoute(
  {
    path: 'employees',
    params: roleGuard(['manager']),
    render: () => <Employees />
  },
  'employeesRoute'
);

export const candidatesRoute = authenticatedRoute.reatomRoute(
  {
    path: 'candidates',
    params: roleGuard(['recruiter']),
    render: () => <Candidates />
  },
  'candidatesRoute'
);

export const planRoute = authenticatedRoute.reatomRoute(
  {
    path: 'plan',
    params: roleGuard(['hr', 'manager', 'employee']),
    render: () => <Plan />
  },
  'planRoute'
);

export const goalsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'goals',
    params: roleGuard(['hr', 'manager', 'employee']),
    render: () => <Goals />
  },
  'goalsRoute'
);

export const achievementsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'achievements',
    params: roleGuard(['hr', 'manager', 'employee']),
    render: () => <Achievements />
  },
  'achievementsRoute'
);

export const welcomePackageRoute = authenticatedRoute.reatomRoute(
  {
    path: 'welcome-package',
    params: roleGuard(['employee', 'hr']),
    render: () => <WelcomePackage />
  },
  'welcomePackageRoute'
);

export const analyticsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'analytics',
    params: roleGuard(['hr', 'recruiter']),
    render: () => <Analytics />
  },
  'analyticsRoute'
);

export const feedbackRoute = authenticatedRoute.reatomRoute(
  {
    path: 'feedback',
    render: () => <Feedback />
  },
  'feedbackRoute'
);

export const settingsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'settings',
    render: () => <Settings />
  },
  'settingsRoute'
);
