import { postApiAuthLogin } from '@api';
import { notifications } from '@mantine/notifications';
import { action, computed, reatomForm, withAsync, wrap } from '@reatom/core';
import { z } from 'zod';

import { router } from '@/app/router';
import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

const loginAction = action(
  async (body: { email: string; password: string }) => await wrap(postApiAuthLogin({ body })),
  'loginAction'
).extend(withAsync());

export const loginForm = reatomForm(
  {
    email: '',
    password: ''
  },
  {
    name: 'loginForm',
    schema: z.object({
      email: z.email('Введите корпоративный email'),
      password: z.string().min(6, 'Минимум 6 символов')
    }),
    onSubmit: async (state) => {
      try {
        const result = await loginAction(state);

        user.set(result.data.user);
        router.dashboard.go();
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

export const isLoading = computed(
  () => !!loginAction.pending() || !!loginForm.submit.pending(),
  'loginForm.isLoading'
);

export const showForgotPasswordHint = () => {
  notifications.show({
    title: 'Восстановление пароля',
    message: 'Обратитесь к HR-менеджеру — он выдаст новый временный пароль.',
    color: 'blue'
  });
};
