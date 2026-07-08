import {
  achievementsRoute,
  analyticsRoute,
  candidatesRoute,
  changePasswordRoute,
  dashboardRoute,
  employeesRoute,
  feedbackRoute,
  goalsRoute,
  loginRoute,
  onboardingsRoute,
  planRoute,
  settingsRoute,
  templatesRoute,
  usersRoute,
  welcomePackageRoute
} from './featureRoutes';
import { rootRoute } from './internal';

export * from './featureRoutes';
export { authenticatedRoute, rootRoute } from './internal';

export const router = {
  root: rootRoute,
  login: loginRoute,
  changePassword: changePasswordRoute,
  dashboard: dashboardRoute,
  onboardings: onboardingsRoute,
  templates: templatesRoute,
  goals: goalsRoute,
  achievements: achievementsRoute,
  analytics: analyticsRoute,
  plan: planRoute,
  feedback: feedbackRoute,
  users: usersRoute,
  candidates: candidatesRoute,
  employees: employeesRoute,
  welcomePackage: welcomePackageRoute,
  settings: settingsRoute
};
