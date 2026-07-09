import { ActionIcon, Button, Group } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconLogout, IconSettings } from '@tabler/icons-react';

import { logout } from '@/app/user.model';

import type { NavigationRoutes } from './components';

import { Header, NavigationLinks, UserInfo } from './components';

import classes from './mainLayout.module.css';

interface Props {
  children: React.ReactNode;
  navigationRoutes: NavigationRoutes;
}

export const MainLayout = reatomComponent<Props>(
  ({ children, navigationRoutes }) => (
    <div className={classes.app}>
      <nav className={classes.sidebar}>
        <div className={classes.logo}>
          <div className={classes.logoMark}>O</div>
          <div className={classes.logoText}>
            Onboard<span>Pro</span>
          </div>
        </div>

        <div className={classes.section}>
          <div className={classes.sectionLabel}>Навигация</div>
          <NavigationLinks routes={navigationRoutes} />
        </div>

        <div className={classes.footer}>
          <Group gap='xs' wrap='nowrap'>
            <UserInfo />
            <ActionIcon
              aria-label='Настройки'
              color='gray'
              variant='subtle'
              onClick={() => navigationRoutes.settings.go({})}
            >
              <IconSettings size={18} stroke={1.5} />
            </ActionIcon>
          </Group>

          <Button
            fullWidth
            color='gray'
            justify='start'
            leftSection={<IconLogout size={18} stroke={1.5} />}
            loading={!!logout.pending()}
            mt='xs'
            size='sm'
            variant='subtle'
            onClick={() => logout()}
          >
            Выйти
          </Button>
        </div>
      </nav>

      <div className={classes.main}>
        <Header routes={navigationRoutes} />
        <div className={classes.content}>{children}</div>
      </div>
    </div>
  ),
  'MainLayout'
);
