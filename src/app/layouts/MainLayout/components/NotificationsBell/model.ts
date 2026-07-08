import type { NotificationResponseDto } from '@api';

import {
  getApiNotifications,
  patchApiNotificationByIdRead,
  patchApiNotificationsReadAll
} from '@api';
import { notifications } from '@mantine/notifications';
import {
  action,
  computed,
  effect,
  reatomBoolean,
  sleep,
  withAsync,
  withAsyncData,
  withConnectHook,
  wrap
} from '@reatom/core';

import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

const showApiError = (error: unknown) => {
  const apiError = getApiError(error);

  notifications.show({
    title: getErrorCodeMessage(apiError.code),
    message: apiError.message,
    color: 'red'
  });
};

const UNREAD_POLL_INTERVAL_MS = 60_000;
const LIST_LIMIT = 30;

export const bellOpened = reatomBoolean(false, 'notifications.bellOpened');

/** Последние уведомления для дропдауна (непрочитанные первыми за счёт сортировки по дате) */
export const notificationsList = computed(async () => {
  const response = await wrap(
    getApiNotifications({ query: { limit: LIST_LIMIT, sortBy: 'createdAt', sortOrder: 'desc' } })
  );

  return response.data.items;
}, 'notifications.list').extend(withAsyncData({ initState: [] }));

/**
 * Точный счётчик непрочитанных для бейджа (meta.totalItems, не ограничен
 * размером списка). Пока бейдж подключён (хедер смонтирован), фоновый эффект
 * обновляет счётчик раз в минуту; эффект НЕ читает сам атом (только retry) —
 * безопасно для connect-hook, снимается на дисконнекте.
 */
export const unreadCount = computed(async () => {
  const response = await wrap(
    getApiNotifications({ query: { status: 'unread', limit: 1 } })
  );

  return response.data.meta.totalItems;
}, 'notifications.unreadCount').extend(
  withAsyncData({ initState: 0 }),
  withConnectHook((target) => {
    const poll = effect(async () => {
      while (true) {
        await wrap(sleep(UNREAD_POLL_INTERVAL_MS));
        target.retry();
      }
    }, 'notifications._unreadPoll');

    return () => poll.unsubscribe();
  })
);

const refresh = () => {
  notificationsList.retry();
  unreadCount.retry();
};

export const toggleBell = action(() => {
  bellOpened.toggle();

  if (bellOpened()) {
    refresh();
  }
}, 'notifications.toggleBell');

export const markRead = action(async (notification: NotificationResponseDto) => {
  if (notification.status === 'read') return;

  try {
    await wrap(patchApiNotificationByIdRead({ path: { id: notification.id } }));

    refresh();
  } catch (error) {
    showApiError(error);
  }
}, 'notifications.markRead').extend(withAsync());

export const markAllRead = action(async () => {
  try {
    await wrap(patchApiNotificationsReadAll());

    refresh();
  } catch (error) {
    showApiError(error);
  }
}, 'notifications.markAllRead').extend(withAsync());

