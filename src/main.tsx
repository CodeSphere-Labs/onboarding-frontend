/* eslint-disable perfectionist/sort-imports --
 * connectLogger расширяет только атомы, созданные ПОСЛЕ вызова: импорт логгера
 * обязан идти до импорта App/router, иначе весь граф остаётся без логирования.
 * Автосортировка импортов уносила его вниз — для entry-файла она отключена. */
import './app/reatomLogger';

import type { RequestConfig, RequestOptions } from '@siberiacancode/fetches';

import { getApiAuthMe } from '@api';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { wrap } from '@reatom/core';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.tsx';
import { router } from './app/router';
import { theme } from './app/theme.ts';
import { user } from './app/user.model.ts';

import './shared/api/session';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

// 401 на бутстрапе — ожидаемый кейс «не залогинен». Без onResponseFailure
// fetches при зарегистрированном response-интерцепторе (shared/api/session.ts)
// оставляет «висящий» Promise.reject для пары интерцепторов без onFailure —
// в консоль летит необработанный ResponseError. Явный onResponseFailure
// пробрасывает ошибку в catch ниже без побочного unhandled rejection.
// apicraft типизирует config как Partial<RequestConfig>, хотя рантайм fetches
// читает из него и RequestOptions-колбэки — поэтому тип расширен пересечением.
const bootstrapAuthConfig: Partial<RequestConfig> & RequestOptions = {
  onResponseFailure: (error) => {
    throw error;
  }
};

const init = async () => {
  try {
    const userResponse = await wrap(getApiAuthMe({ config: bootstrapAuthConfig }));

    user.set(userResponse.data.user);
  } catch {
    router.login.go(undefined, true);
  }

  createRoot(document.getElementById('root')!).render(
    <MantineProvider defaultColorScheme='auto' theme={theme}>
      <ModalsProvider>
        <Notifications position='top-right' />
        <App />
      </ModalsProvider>
    </MantineProvider>
  );
};

init();
