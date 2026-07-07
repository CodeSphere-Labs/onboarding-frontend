import { ActionIcon, Group, Indicator, Title } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconBell } from '@tabler/icons-react';

import { user } from '@/app/user.model';

import type { NavigationRoutes } from '../navigation';

import { getNavigationLabel, NAVIGATION_ITEMS } from '../navigation';
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
        {/* Счётчик непрочитанных подключается в задаче про in-app уведомления (OSS-18) */}
        <Indicator disabled color='red' offset={4} size={14}>
          <ActionIcon aria-label='Уведомления' size='lg' variant='default'>
            <IconBell stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Group>
    </header>
  );
}, 'Header');
