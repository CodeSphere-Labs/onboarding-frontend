import type { Icon } from '@tabler/icons-react';

import { reatomComponent } from '@reatom/react';
import {
  IconChecklist,
  IconFiles,
  IconGift,
  IconLayoutDashboard,
  IconListCheck,
  IconMessageReply,
  IconSettings,
  IconTargetArrow,
  IconUsers
} from '@tabler/icons-react';

import type { UserRole } from '@/shared/components';

import { user } from '@/app/user.model';

import classes from './navigationLinks.module.css';

interface NavigationRoute {
  exact: () => boolean;
  go: () => unknown;
  path: () => string;
}

export interface NavigationRoutes {
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

interface NavigationLink {
  icon: Icon;
  label: string;
  /** Не указано — пункт виден всем ролям */
  roles?: readonly UserRole[];
  route: NavigationRoute;
}

export const NavigationLinks = reatomComponent(({ routes }: { routes: NavigationRoutes }) => {
  const role = user()?.role;

  const links: NavigationLink[] = [
    { route: routes.dashboard, label: 'Дашборд', icon: IconLayoutDashboard },
    { route: routes.onboardings, label: 'Онбординги', icon: IconListCheck, roles: ['hr'] },
    { route: routes.templates, label: 'Шаблоны', icon: IconFiles, roles: ['hr'] },
    { route: routes.users, label: 'Пользователи', icon: IconUsers, roles: ['hr'] },
    { route: routes.employees, label: 'Мои сотрудники', icon: IconUsers, roles: ['manager'] },
    { route: routes.candidates, label: 'Мои кандидаты', icon: IconUsers, roles: ['recruiter'] },
    {
      route: routes.plan,
      label: 'План',
      icon: IconChecklist,
      roles: ['hr', 'manager', 'employee']
    },
    {
      route: routes.goals,
      label: 'Цели',
      icon: IconTargetArrow,
      roles: ['hr', 'manager', 'employee']
    },
    { route: routes.feedback, label: 'Фидбек', icon: IconMessageReply },
    {
      route: routes.welcomePackage,
      label: 'Welcome-пакет',
      icon: IconGift,
      roles: ['employee', 'hr']
    },
    { route: routes.settings, label: 'Настройки', icon: IconSettings }
  ];

  const visibleLinks = links.filter((link) => !link.roles || (role && link.roles.includes(role)));

  return (
    <>
      {visibleLinks.map((item) => (
        <a
          key={item.label}
          className={classes.link}
          data-active={item.route.exact() || undefined}
          href={item.route.path()}
          onClick={(event) => {
            event.preventDefault();
            item.route.go();
          }}
        >
          <item.icon className={classes.linkIcon} stroke={1.5} />
          <span>{item.label}</span>
        </a>
      ))}
    </>
  );
}, 'NavigationLinks');
