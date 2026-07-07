import { getApiAuthMe } from '@api';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { wrap } from '@reatom/core';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.tsx';
import { router } from './app/router';
import { user } from './app/user.model.ts';

import './app/reatomLogger';
import './shared/api/session';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const init = async () => {
  try {
    const userResponse = await wrap(getApiAuthMe());

    user.set(userResponse.data.user);
  } catch {
    router.login.go(undefined, true);
  }

  createRoot(document.getElementById('root')!).render(
    <MantineProvider defaultColorScheme='auto'>
      <ModalsProvider>
        <Notifications position='top-right' />
        <App />
      </ModalsProvider>
    </MantineProvider>
  );
};

init();
