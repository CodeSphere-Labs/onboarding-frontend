import { Group, Title } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { user } from '@/app/user.model';

import type { NavigationRoutes } from '../navigation';

import { getNavigationLabel, NAVIGATION_ITEMS } from '../navigation';
import { NotificationsBell } from '../NotificationsBell/NotificationsBell';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

import classes from './header.module.css';

export const Header = reatomComponent(({ routes }: { routes: NavigationRoutes }) => {
  const role = user()?.role;
  const activeItem = NAVIGATION_ITEMS.find((item) => routes[item.routeKey].exact());
  const title = activeItem ? getNavigationLabel(activeItem, role) : 'OnboardPro';

  return (
    <header className={classes.header}>
      <Title className={classes.title} order={5}>
        {title}
      </Title>

      <Group gap='xs'>
        <ThemeToggle />
        <NotificationsBell />
      </Group>
    </header>
  );
}, 'Header');
