import { postApiAuthChangeTemporaryPassword } from '@api';
import { notifications } from '@mantine/notifications';
import { computed, reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';

import { router } from '@/app/router';
import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

export const changePasswordForm = reatomForm(
  {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  {
    name: 'changePasswordForm',
    schema: z
      .object({
        currentPassword: z.string().min(8, 'Минимум 8 символов'),
        newPassword: z.string().min(8, 'Минимум 8 символов'),
        confirmPassword: z.string()
      })
      .refine((values) => values.newPassword === values.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword']
      }),
    onSubmit: async ({ currentPassword, newPassword }) => {
      try {
        const result = await wrap(
          postApiAuthChangeTemporaryPassword({ body: { currentPassword, newPassword } })
        );

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
  () => !!changePasswordForm.submit.pending(),
  'changePasswordForm.isLoading'
);
