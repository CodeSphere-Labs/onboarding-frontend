import type { Icon } from '@tabler/icons-react';

import {
  IconChartBar,
  IconChecklist,
  IconFiles,
  IconGift,
  IconLayoutDashboard,
  IconListCheck,
  IconMessageReply,
  IconSettings,
  IconTargetArrow,
  IconTrophy,
  IconUsers,
  IconUserSearch,
  IconUsersGroup
} from '@tabler/icons-react';

import type { UserRole } from '@/shared/components';

export interface NavigationRoute {
  exact: () => boolean;
  go: () => unknown;
  path: () => string;
}

export interface NavigationRoutes {
  achievements: NavigationRoute;
  analytics: NavigationRoute;
  candidates: NavigationRoute;
  dashboard: NavigationRoute;
  employees: NavigationRoute;
  feedback: NavigationRoute;
  goals: NavigationRoute;
  onboardings: NavigationRoute;
  plan: NavigationRoute;
  settings: NavigationRoute;
  templates: NavigationRoute;
  users: NavigationRoute;
  welcomePackage: NavigationRoute;
}

export interface NavigationItem {
  icon: Icon;
  /** false — пункт не показывается в сайдбаре (но участвует в заголовке шапки) */
  inNav?: boolean;
  label: string;
  /** Переопределение названия для конкретной роли (в дизайне у сотрудника «Мой план», «Мои цели») */
  roleLabels?: Partial<Record<UserRole, string>>;
  /** Не указано — пункт виден всем ролям */
  roles?: readonly UserRole[];
  routeKey: keyof NavigationRoutes;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { routeKey: 'dashboard', label: 'Дашборд', icon: IconLayoutDashboard },
  { routeKey: 'onboardings', label: 'Онбординги', icon: IconListCheck, roles: ['hr'] },
  { routeKey: 'templates', label: 'Шаблоны', icon: IconFiles, roles: ['hr'] },
  { routeKey: 'users', label: 'Пользователи', icon: IconUsers, roles: ['hr'] },
  { routeKey: 'analytics', label: 'Аналитика', icon: IconChartBar, roles: ['hr', 'recruiter'] },
  { routeKey: 'employees', label: 'Мои сотрудники', icon: IconUsersGroup, roles: ['manager'] },
  { routeKey: 'candidates', label: 'Мои кандидаты', icon: IconUserSearch, roles: ['recruiter'] },
  {
    routeKey: 'plan',
    label: 'План',
    roleLabels: { employee: 'Мой план' },
    icon: IconChecklist,
    roles: ['hr', 'manager', 'employee']
  },
  {
    routeKey: 'goals',
    label: 'Цели',
    roleLabels: { employee: 'Мои цели' },
    icon: IconTargetArrow,
    roles: ['hr', 'manager', 'employee']
  },
  {
    routeKey: 'achievements',
    label: 'Достижения',
    icon: IconTrophy,
    roles: ['hr', 'manager', 'employee']
  },
  { routeKey: 'feedback', label: 'Фидбек', icon: IconMessageReply },
  {
    routeKey: 'welcomePackage',
    label: 'Welcome-пакет',
    icon: IconGift,
    roles: ['employee', 'hr']
  },
  { routeKey: 'settings', label: 'Настройки', icon: IconSettings, inNav: false }
];

export const getNavigationLabel = (item: NavigationItem, role?: UserRole) =>
  (role && item.roleLabels?.[role]) || item.label;
