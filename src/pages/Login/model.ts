import { postApiAuthLogin } from '@api';
import { notifications } from '@mantine/notifications';
import { action, computed, reatomForm, urlAtom, withAsyncData } from '@reatom/core';
import { z } from 'zod';

import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

const loginAction = action(postApiAuthLogin).extend(withAsyncData());

export const loginForm = reatomForm(
  {
    email: '',
    password: ''
  },
  {
    name: 'loginForm',
    schema: z.object({
      email: z.email(),
      password: z.string().min(6)
    }),
    onSubmit: async (state) => {
      try {
        const result = await loginAction({ body: state });

        user.set(result.data.user);
        urlAtom.go('/', true);
      } catch (error) {
        const apiError = getApiError(error);

        notifications.show({
          title: getErrorCodeMessage(apiError.code),
          message: apiError.message,
          color: 'red'
        });
      }
    }
  }
);

export const isLoading = computed(() => !!loginAction.pending() || !!loginForm.submit.pending());
