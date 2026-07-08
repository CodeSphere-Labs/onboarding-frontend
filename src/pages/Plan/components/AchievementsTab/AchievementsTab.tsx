import type { AchievementResponseDto } from '@api';
import type { SubmitEventHandler } from 'react';

import {
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Text,
  Textarea,
  TextInput
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconCheck, IconPlus, IconTrophy, IconX } from '@tabler/icons-react';

import {
  achievementForm,
  achievementModalOpened,
  achievementsList,
  asText,
  confirmAchievement,
  goalsList,
  openAchievementModal,
  planPermissions
} from '../../model';

const ACHIEVEMENT_STATUS_META: Record<
  AchievementResponseDto['status'],
  { color: string; label: string }
> = {
  pending: { color: 'orange', label: 'Ожидает подтверждения' },
  confirmed: { color: 'green', label: 'Подтверждено' },
  rejected: { color: 'red', label: 'Отклонено' }
};

const MONTH_OPTIONS = [
  { value: '1', label: 'Месяц 1' },
  { value: '2', label: 'Месяц 2' },
  { value: '3', label: 'Месяц 3' }
];

const AchievementModal = reatomComponent(() => {
  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault();
    achievementForm.submit();
  };

  return (
    <Modal
      centered
      opened={achievementModalOpened()}
      title='Добавить достижение'
      onClose={() => achievementModalOpened.setFalse()}
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          data-autofocus
          label='Название'
          placeholder='Коротко (необязательно)'
          {...bindField(achievementForm.fields.title)}
        />
        <Textarea
          withAsterisk
          label='Описание'
          mt='sm'
          placeholder='Что сделано и какой результат'
          rows={3}
          {...bindField(achievementForm.fields.description)}
        />
        <Select
          allowDeselect={false}
          data={MONTH_OPTIONS}
          label='Месяц'
          mt='sm'
          {...bindField(achievementForm.fields.monthNo)}
          onChange={(value) => achievementForm.fields.monthNo.change(value ?? '1')}
        />
        <Select
          clearable
          data={goalsList.data().map((goal) => ({ value: goal.id, label: goal.title }))}
          label='Связанная цель'
          mt='sm'
          placeholder='Без привязки'
          {...bindField(achievementForm.fields.goalId)}
          onChange={(value) => achievementForm.fields.goalId.change(value ?? '')}
        />
        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={() => achievementModalOpened.setFalse()}>
            Отмена
          </Button>
          <Button loading={!!achievementForm.submit.pending()} type='submit'>
            Добавить
          </Button>
        </Group>
      </form>
    </Modal>
  );
}, 'AchievementModal');

export const AchievementsTab = reatomComponent(() => {
  const achievements = achievementsList.data();
  const permissions = planPermissions();
  const goalTitles = new Map(goalsList.data().map((goal) => [goal.id, goal.title]));

  return (
    <>
      {permissions.addAchievement && (
        <Group justify='flex-end' mb='sm'>
          <Button
            leftSection={<IconPlus size={14} />}
            size='xs'
            onClick={() => openAchievementModal()}
          >
            Добавить достижение
          </Button>
        </Group>
      )}

      {achievements.map((achievement) => {
        const statusMeta = ACHIEVEMENT_STATUS_META[achievement.status];
        const title = asText(achievement.title);
        const goalId = asText(achievement.goalId);
        const managerComment = asText(achievement.managerComment);

        return (
          <Paper withBorder key={achievement.id} mb='xs' p='md' radius='md'>
            <Group align='flex-start' gap='xs' wrap='nowrap'>
              <IconTrophy opacity={0.5} size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} fz='sm'>
                  {title || achievement.description}
                </Text>
                {title && (
                  <Text c='dimmed' fz='xs' mt={2}>
                    {achievement.description}
                  </Text>
                )}
                <Group gap={8} mt={6}>
                  <Text c='dimmed' fz={11}>
                    {new Date(achievement.createdAt).toLocaleDateString('ru-RU')} · Месяц{' '}
                    {achievement.monthNo}
                  </Text>
                  {goalId && goalTitles.get(goalId) && (
                    <Badge color='gray' size='xs' variant='light'>
                      Цель: {goalTitles.get(goalId)}
                    </Badge>
                  )}
                </Group>
                {managerComment && (
                  <Text c='dimmed' fz='xs' mt={4}>
                    Комментарий менеджера: {managerComment}
                  </Text>
                )}
              </div>
              <Badge color={statusMeta.color} size='sm' variant='light'>
                {statusMeta.label}
              </Badge>
              {permissions.confirmAchievement && achievement.status === 'pending' && (
                <Group gap={4} wrap='nowrap'>
                  <Button
                    color='green'
                    leftSection={<IconCheck size={13} />}
                    loading={!!confirmAchievement.pending()}
                    size='compact-xs'
                    variant='light'
                    onClick={() => confirmAchievement(achievement, 'confirmed')}
                  >
                    Подтвердить
                  </Button>
                  <Button
                    color='red'
                    leftSection={<IconX size={13} />}
                    size='compact-xs'
                    variant='subtle'
                    onClick={() => confirmAchievement(achievement, 'rejected')}
                  >
                    Отклонить
                  </Button>
                </Group>
              )}
            </Group>
          </Paper>
        );
      })}

      {achievements.length === 0 && (
        <Text c='dimmed' fz='sm' py='xl' ta='center'>
          Достижений пока нет
        </Text>
      )}

      <AchievementModal />
    </>
  );
}, 'AchievementsTab');
