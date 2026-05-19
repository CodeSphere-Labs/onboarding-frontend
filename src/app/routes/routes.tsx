/* eslint-disable ts/no-use-before-define */
import { reatomRoute } from '@reatom/core';

import { MainLayout } from '@/app/layouts';
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

import { user } from '../user.model';

export const rootRoute = reatomRoute(
  {
    render(self) {
      return <>{self.outlet()}</>;
    }
  },
  'rootRoute'
);

export const loginRoute = rootRoute.reatomRoute(
  {
    path: 'login',
    exactRender: true,
    render() {
      return <Login />;
    }
  },
  'loginRoute'
);

export const authenticatedRoute = rootRoute.reatomRoute(
  {
    params() {
      const userData = user();

      if (!userData) {
        if (!loginRoute.match()) {
          loginRoute.go();
        }

        return null;
      }

      if (loginRoute.match()) {
        dashboardRoute.go();
      }

      return { user: userData };
    },

    render(self) {
      return <MainLayout navigationRoutes={router}>{self.outlet()}</MainLayout>;
    }
  },
  'authenticatedRoute'
);

export const dashboardRoute = authenticatedRoute.reatomRoute(
  {
    exactRender: true,
    path: '',
    render: () => <Dashboard />
  },
  'dashboardRoute'
);

export const onboardingsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'onboardings',
    render: () => <Onboardings />
  },
  'onboardingsRoute'
);

export const templatesRoute = authenticatedRoute.reatomRoute(
  {
    path: 'templates',
    render: () => <Templates />
  },
  'templatesRoute'
);

export const goalsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'goals',
    render: () => <Goals />
  },
  'goalsRoute'
);

export const planRoute = authenticatedRoute.reatomRoute(
  {
    path: 'plan',
    render: () => <Plan />
  },
  'planRoute'
);

export const feedbackRoute = authenticatedRoute.reatomRoute(
  {
    path: 'feedback',
    render: () => <Feedback />
  },
  'feedbackRoute'
);

export const usersRoute = authenticatedRoute.reatomRoute(
  {
    path: 'users',
    render: () => <Users />
  },
  'usersRoute'
);

export const candidatesRoute = authenticatedRoute.reatomRoute(
  {
    path: 'candidates',
    render: () => <Candidates />
  },
  'candidatesRoute'
);

export const employeesRoute = authenticatedRoute.reatomRoute(
  {
    path: 'employees',
    render: () => <Employees />
  },
  'employeesRoute'
);

export const welcomePackageRoute = authenticatedRoute.reatomRoute(
  {
    path: 'welcome-package',
    render: () => <WelcomePackage />
  },
  'welcomePackageRoute'
);

export const settingsRoute = authenticatedRoute.reatomRoute(
  {
    path: 'settings',
    render: () => <Settings />
  },
  'settingsRoute'
);

export const router = {
  login: loginRoute,
  dashboard: dashboardRoute,
  onboardings: onboardingsRoute,
  templates: templatesRoute,
  goals: goalsRoute,
  plan: planRoute,
  feedback: feedbackRoute,
  users: usersRoute,
  candidates: candidatesRoute,
  employees: employeesRoute,
  welcomePackage: welcomePackageRoute,
  settings: settingsRoute
};
