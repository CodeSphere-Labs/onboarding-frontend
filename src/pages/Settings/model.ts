import { postApiAuthChangePassword } from '@api';
import { notifications } from '@mantine/notifications';
import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';

import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

export const changePasswordForm = reatomForm(
  {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  {
    name: 'settings.changePasswordForm',
    schema: z
      .object({
        currentPassword: z.string().min(1, 'Введите текущий пароль'),
        newPassword: z.string().min(8, 'Минимум 8 символов'),
        confirmPassword: z.string()
      })
      .refine((state) => state.newPassword === state.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword']
      })
      .refine((state) => state.newPassword !== state.currentPassword, {
        message: 'Новый пароль должен отличаться от текущего',
        path: ['newPassword']
      }),
    onSubmit: async (state) => {
      try {
        const response = await wrap(
          postApiAuthChangePassword({
            body: {
              currentPassword: state.currentPassword,
              newPassword: state.newPassword
            }
          })
        );

        user.set(response.data.user);
        changePasswordForm.reset();
        notifications.show({
          message: 'Пароль изменён. Остальные сессии завершены',
          color: 'green'
        });
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
