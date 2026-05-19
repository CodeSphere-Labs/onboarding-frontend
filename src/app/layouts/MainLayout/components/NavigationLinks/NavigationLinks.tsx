import type { Icon } from '@tabler/icons-react';

import { reatomComponent } from '@reatom/react';
import {
  IconChecklist,
  IconFiles,
  IconLayoutDashboard,
  IconListCheck,
  IconMessageReply,
  IconSettings,
  IconStar,
  IconTargetArrow,
  IconUsers
} from '@tabler/icons-react';

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
  route: NavigationRoute;
}

export const NavigationLinks = reatomComponent(
  ({ routes }: { routes: NavigationRoutes }) => {
    const links: NavigationLink[] = [
      { route: routes.dashboard, label: 'Дашборд', icon: IconLayoutDashboard },
      { route: routes.onboardings, label: 'Онбординги', icon: IconListCheck },
      { route: routes.templates, label: 'Шаблоны', icon: IconFiles },
      { route: routes.goals, label: 'Цели', icon: IconTargetArrow },
      { route: routes.plan, label: 'План', icon: IconChecklist },
      { route: routes.feedback, label: 'Фидбек', icon: IconMessageReply },
      { route: routes.users, label: 'Пользователи', icon: IconUsers },
      { route: routes.candidates, label: 'Кандидаты', icon: IconUsers },
      { route: routes.employees, label: 'Сотрудники', icon: IconUsers },
      { route: routes.welcomePackage, label: 'Welcome-пакет', icon: IconStar },
      { route: routes.settings, label: 'Настройки', icon: IconSettings }
    ];

    return (
      <>
        {links.map((item) => (
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
  },
  'NavigationLinks'
);
