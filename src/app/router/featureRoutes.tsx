import type { Computed, RouteChild } from '@reatom/core';

import type { UserRole } from '@/shared/lib/routing';

import {
  Candidates,
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

export const loginRoute = rootRoute.reatomRoute(
  {
    path: 'login',
    params() {
      if (user()) {
        router.dashboard.go(undefined, true);

        return null;
      }

      return {};
    },
    render: () => <Login />
  },
  'loginRoute'
);

export const dashboardRoute = authenticatedRoute.reatomRoute(
  {
    path: '',
    render: () => <Dashboard />
  },
  'dashboardRoute'
);

const createRoleLayoutRoute = (allowedRoles: readonly UserRole[], name: string) =>
  authenticatedRoute.reatomRoute(
    {
      params: createRoleGuard({
        allowedRoles,
        onDenied: () => {
          router.dashboard.go();
        },
        parentRoute: authenticatedRoute
      }),

      layout: true,
      render(self: { outlet: Computed<RouteChild[]> }) {
        return <>{self.outlet()}</>;
      }
    },
    name
  );

const hrRoute = createRoleLayoutRoute(['hr'], 'hrRoute');
const managerRoute = createRoleLayoutRoute(['manager'], 'managerRoute');
const recruiterRoute = createRoleLayoutRoute(['recruiter'], 'recruiterRoute');
const planAccessRoute = createRoleLayoutRoute(['hr', 'manager', 'employee'], 'planAccessRoute');
const welcomePackageAccessRoute = createRoleLayoutRoute(
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
