import { Button, Group } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

import type { NavigationRoutes } from './components';

import { NavigationLinks, ThemeToggle, UserInfo } from './components';

import classes from './mainLayout.module.css';

interface Props {
  children: React.ReactNode;
  navigationRoutes: NavigationRoutes;
}

export const MainLayout = ({ children, navigationRoutes }: Props) => (
  <main className={classes.main}>
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify='space-between'>
          <UserInfo />
          <ThemeToggle />
        </Group>
        <NavigationLinks routes={navigationRoutes} />
      </div>

      <div className={classes.footer}>
        <Button
          fullWidth
          justify='start'
          leftSection={<IconLogout className={classes.footerLinkIcon} stroke={1.5} />}
          variant='transparent'
        >
          Выйти
        </Button>
      </div>
    </nav>

    {children}
  </main>
);
