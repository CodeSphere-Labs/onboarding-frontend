import type { FeedbackRecipientResponseDto } from '@api';

import { getApiFeedback, getApiFeedbackRecipients, postApiFeedback } from '@api';
import { notifications } from '@mantine/notifications';
import { action, computed, reatomBoolean, reatomForm, withAsyncData, wrap } from '@reatom/core';
import { z } from 'zod';

import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

const showApiError = (error: unknown) => {
  const apiError = getApiError(error);

  notifications.show({
    title: getErrorCodeMessage(apiError.code),
    message: apiError.message,
    color: 'red'
  });
};

export const recipientFullName = (recipient: FeedbackRecipientResponseDto) =>
  `${recipient.lastName} ${recipient.firstName}`.trim();

// ── Данные ────────────────────────────────────────────────────────────────

export const feedbackList = computed(async () => {
  const response = await wrap(getApiFeedback({ query: { limit: 100 } }));

  return response.data.items;
}, 'feedback.list').extend(withAsyncData({ initState: [] }));

/** Кому можно оставить фидбек (эндпоинт доступен всем ролям) */
export const recipients = computed(async () => {
  const response = await wrap(getApiFeedbackRecipients());

  return response.data.items;
}, 'feedback.recipients').extend(withAsyncData({ initState: [] }));

export const recipientNameById = computed(
  () => new Map(recipients.data().map((item) => [item.id, recipientFullName(item)])),
  'feedback.recipientNameById'
);

// ── Вкладки: полученный / отправленный / команда ─────────────────────────

export const receivedFeedback = computed(
  () => feedbackList.data().filter((item) => item.recipientId === user()?.id),
  'feedback.received'
);

export const sentFeedback = computed(
  () => feedbackList.data().filter((item) => item.isMine),
  'feedback.sent'
);

/** Видимый фидбек по другим людям: у HR — все, у менеджера/рекрутера — свои */
export const teamFeedback = computed(
  () =>
    feedbackList
      .data()
      .filter((item) => !item.isMine && item.recipientId !== user()?.id),
  'feedback.team'
);

export const teamTabLabel = computed(() => {
  switch (user()?.role) {
    case 'hr':
      return 'Все сотрудники';
    case 'manager':
      return 'Мои сотрудники';
    case 'recruiter':
      return 'Мои кандидаты';
    default:
      return undefined;
  }
}, 'feedback.teamTabLabel');

// ── Оставить фидбек ───────────────────────────────────────────────────────

export const createModalOpened = reatomBoolean(false, 'feedback.createModalOpened');

export const createFeedbackForm = reatomForm(
  {
    recipientId: '',
    strengths: '',
    improvements: ''
  },
  {
    name: 'feedback.createForm',
    schema: z.object({
      recipientId: z.string().min(1, 'Выберите получателя'),
      strengths: z.string().trim().min(3, 'Расскажите, что получается хорошо'),
      improvements: z.string().trim().min(3, 'Расскажите, что можно улучшить')
    }),
    onSubmit: async (state) => {
      try {
        await wrap(
          postApiFeedback({
            body: {
              recipientId: state.recipientId,
              strengths: state.strengths.trim(),
              improvements: state.improvements.trim()
            }
          })
        );

        feedbackList.retry();
        createModalOpened.setFalse();
        notifications.show({ message: 'Фидбек отправлен анонимно', color: 'green' });
      } catch (error) {
        showApiError(error);
      }
    }
  }
);

export const openCreateModal = action(() => {
  createFeedbackForm.reset();
  createModalOpened.setTrue();
}, 'feedback.openCreateModal');
