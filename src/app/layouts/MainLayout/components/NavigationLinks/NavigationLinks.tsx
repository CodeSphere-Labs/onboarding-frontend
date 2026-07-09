import { reatomComponent } from '@reatom/react';

import { user } from '@/app/user.model';

import type { NavigationRoutes } from '../navigation';

import { getNavigationLabel, NAVIGATION_ITEMS } from '../navigation';

import classes from './navigationLinks.module.css';

export const NavigationLinks = reatomComponent(({ routes }: { routes: NavigationRoutes }) => {
  const role = user()?.role;

  const visibleItems = NAVIGATION_ITEMS.filter(
    (item) => item.inNav !== false && (!item.roles || (role && item.roles.includes(role)))
  );

  return (
    <>
      {visibleItems.map((item) => {
        const route = routes[item.routeKey];

        return (
          <a
            key={item.routeKey}
            className={classes.link}
            data-active={route.exact() || undefined}
            href={route.path({})}
            onClick={(event) => {
              event.preventDefault();
              route.go({});
            }}
          >
            <item.icon className={classes.linkIcon} stroke={1.5} />
            <span>{getNavigationLabel(item, role)}</span>
          </a>
        );
      })}
    </>
  );
}, 'NavigationLinks');
