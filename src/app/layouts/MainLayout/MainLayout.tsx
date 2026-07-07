import { Button, Group } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconLogout } from '@tabler/icons-react';

import { logout } from '@/app/user.model';

import type { NavigationRoutes } from './components';

import { NavigationLinks, ThemeToggle, UserInfo } from './components';

import classes from './mainLayout.module.css';

interface Props {
  children: React.ReactNode;
  navigationRoutes: NavigationRoutes;
}

export const MainLayout = reatomComponent<Props>(
  ({ children, navigationRoutes }) => (
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
            loading={!!logout.pending()}
            variant='transparent'
            onClick={() => logout()}
          >
            Выйти
          </Button>
        </div>
      </nav>

      {children}
    </main>
  ),
  'MainLayout'
);
