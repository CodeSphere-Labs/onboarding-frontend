import type { NotificationResponseDto } from '@api';

import {
  ActionIcon,
  Button,
  Group,
  Indicator,
  Popover,
  ScrollArea,
  Text,
  ThemeIcon
} from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconBell,
  IconChecklist,
  IconChecks,
  IconInfoCircle,
  IconMessageReply,
  IconTargetArrow,
  IconTrophy
} from '@tabler/icons-react';

import {
  bellOpened,
  markAllRead,
  markRead,
  notificationsList,
  toggleBell,
  unreadCount
} from './model';

import classes from './notificationsBell.module.css';

const TYPE_META: Record<
  NotificationResponseDto['type'],
  { color: string; icon: typeof IconBell }
> = {
  task_assigned: { color: 'blue', icon: IconChecklist },
  goal_assigned: { color: 'violet', icon: IconTargetArrow },
  feedback_received: { color: 'teal', icon: IconMessageReply },
  achievement_confirmed: { color: 'green', icon: IconTrophy },
  system: { color: 'gray', icon: IconInfoCircle }
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();

  return sameDay
    ? date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('ru-RU');
};

const NotificationRow = reatomComponent(
  ({ notification }: { notification: NotificationResponseDto }) => {
    const meta = TYPE_META[notification.type];

    return (
      <button
        className={classes.row}
        data-unread={notification.status === 'unread' || undefined}
        type='button'
        onClick={() => markRead(notification)}
      >
        <ThemeIcon color={meta.color} radius='xl' size={30} variant='light'>
          <meta.icon size={16} />
        </ThemeIcon>
        <div className={classes.rowBody}>
          <Text fw={notification.status === 'unread' ? 700 : 500} fz={13} lh={1.3}>
            {notification.title}
          </Text>
          <Text c='dimmed' fz={12} lh={1.35}>
            {notification.body}
          </Text>
          <Text c='dimmed' fz={11} mt={2}>
            {formatTime(notification.createdAt)}
          </Text>
        </div>
        {notification.status === 'unread' && <span className={classes.unreadDot} />}
      </button>
    );
  },
  'NotificationRow'
);

export const NotificationsBell = reatomComponent(() => {
  const count = unreadCount.data();

  return (
    <Popover
      withArrow
      opened={bellOpened()}
      position='bottom-end'
      shadow='md'
      width={360}
      onDismiss={() => bellOpened.setFalse()}
    >
      <Popover.Target>
        <Indicator
          color='red'
          disabled={count === 0}
          label={count > 9 ? '9+' : count}
          offset={4}
          size={16}
        >
          <ActionIcon
            aria-label='Уведомления'
            size='lg'
            variant='default'
            onClick={() => toggleBell()}
          >
            <IconBell stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group justify='space-between' p='sm' pb='xs'>
          <Text fw={700} fz='sm'>
            Уведомления
          </Text>
          <Button
            color='gray'
            leftSection={<IconChecks size={14} />}
            loading={!!markAllRead.pending()}
            size='compact-xs'
            variant='subtle'
            onClick={() => markAllRead()}
          >
            Прочитать все
          </Button>
        </Group>

        <ScrollArea.Autosize mah={420}>
          {notificationsList.data().map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
          {notificationsList.data().length === 0 && (
            <Text c='dimmed' fz='sm' px='md' py='xl' ta='center'>
              Уведомлений пока нет
            </Text>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}, 'NotificationsBell');
