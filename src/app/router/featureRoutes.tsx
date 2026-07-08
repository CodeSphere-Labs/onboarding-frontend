import type { Computed, RouteChild } from '@reatom/core';

import type { UserRole } from '@/shared/lib/routing';

import {
  Candidates,
  ChangePassword,
  Dashboard,
  Employees,
  Feedback,
  Goals,
  Login,
  Onboardings,
  Plan,
  Settings,
  Templates,
  Users,
  WelcomePackage
} from '@/pages';
import { createRoleGuard } from '@/shared/lib/routing';

import { router } from '.';
import { user } from '../user.model';
import { authenticatedRoute, rootRoute } from './internal';
import { renderOutlet } from './renderOutlet';

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

export const dashboardRoute = authenticatedRoute.reatomRoute(
  {
    path: '',
    render: () => <Dashboard />
  },
  'dashboardRoute'
);

const reatomRoleLayoutRoute = (allowedRoles: readonly UserRole[], name: string) =>
  authenticatedRoute.reatomRoute(
    {
      params: createRoleGuard({
        allowedRoles,
        onDenied: () => {
          router.dashboard.go(undefined, true);
        },
        parentRoute: authenticatedRoute
      }),

      layout: true,
      render(self: { outlet: Computed<RouteChild[]> }) {
        return <>{renderOutlet(self.outlet())}</>;
      }
    },
    name
  );

const hrRoute = reatomRoleLayoutRoute(['hr'], 'hrRoute');
const managerRoute = reatomRoleLayoutRoute(['manager'], 'managerRoute');
const recruiterRoute = reatomRoleLayoutRoute(['recruiter'], 'recruiterRoute');
const planAccessRoute = reatomRoleLayoutRoute(['hr', 'manager', 'employee'], 'planAccessRoute');
const welcomePackageAccessRoute = reatomRoleLayoutRoute(
  ['employee', 'hr'],
  'welcomePackageAccessRoute'
);

export const onboardingsRoute = hrRoute.reatomRoute(
  {
    path: 'onboardings',
    render: () => <Onboardings />
  },
  'onboardingsRoute'
);

export const templatesRoute = hrRoute.reatomRoute(
  {
    path: 'templates',
    render: () => <Templates />
  },
  'templatesRoute'
);

export const usersRoute = hrRoute.reatomRoute(
  {
    path: 'users',
    render: () => <Users />
  },
  'usersRoute'
);

export const employeesRoute = managerRoute.reatomRoute(
  {
    path: 'employees',
    render: () => <Employees />
  },
  'employeesRoute'
);

export const candidatesRoute = recruiterRoute.reatomRoute(
  {
    path: 'candidates',
    render: () => <Candidates />
  },
  'candidatesRoute'
);

export const planRoute = planAccessRoute.reatomRoute(
  {
    path: 'plan',
    render: () => <Plan />
  },
  'planRoute'
);

export const goalsRoute = planAccessRoute.reatomRoute(
  {
    path: 'goals',
    render: () => <Goals />
  },
  'goalsRoute'
);

export const welcomePackageRoute = welcomePackageAccessRoute.reatomRoute(
  {
    path: 'welcome-package',
    render: () => <WelcomePackage />
  },
  'welcomePackageRoute'
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
