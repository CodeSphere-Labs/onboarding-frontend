import type { GoalResponseDto } from '@api';
import type { SubmitEventHandler } from 'react';

import {
  ActionIcon,
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
import { IconPencil, IconPlus, IconTargetArrow } from '@tabler/icons-react';

import { getPeriodMeta } from '../../../Templates/periods';
import {
  asText,
  editingGoal,
  GOAL_PERIODS,
  goalForm,
  goalsList,
  planPermissions
} from '../../model';

const GOAL_STATUS_META: Record<GoalResponseDto['status'], { color: string; label: string }> = {
  in_progress: { color: 'blue', label: 'В работе' },
  completed: { color: 'green', label: 'Выполнена' },
  cancelled: { color: 'gray', label: 'Отменена' }
};

const GOAL_STATUS_OPTIONS = Object.entries(GOAL_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label
}));

const PERIOD_OPTIONS = GOAL_PERIODS.map((period) => ({
  value: period,
  label: getPeriodMeta(period).label
}));

const GoalModal = reatomComponent(() => {
  const goal = editingGoal();
  const form = goalForm();

  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault();
    form?.submit();
  };

  return (
    <Modal
      centered
      opened={goal !== undefined}
      title={goal ? 'Редактировать цель' : 'Новая цель'}
      onClose={() => editingGoal.set(undefined)}
    >
      {form && (
        <form onSubmit={handleSubmit}>
          <TextInput
            data-autofocus
            withAsterisk
            label='Название'
            placeholder='Чего нужно достичь'
            {...bindField(form.fields.title)}
          />
          <Textarea
            label='Комментарий'
            mt='sm'
            placeholder='Критерии успеха, детали…'
            rows={3}
            {...bindField(form.fields.description)}
          />
          <Select
            allowDeselect={false}
            data={PERIOD_OPTIONS}
            label='Период'
            mt='sm'
            {...bindField(form.fields.period)}
            onChange={(value) => form.fields.period.change(value ?? 'month_1')}
          />
          {goal && (
            <Select
              allowDeselect={false}
              data={GOAL_STATUS_OPTIONS}
              label='Статус'
              mt='sm'
              {...bindField(form.fields.status)}
              onChange={(value) => form.fields.status.change(value ?? 'in_progress')}
            />
          )}
          <Group justify='flex-end' mt='lg'>
            <Button variant='default' onClick={() => editingGoal.set(undefined)}>
              Отмена
            </Button>
            <Button loading={!!form.submit.pending()} type='submit'>
              Сохранить
            </Button>
          </Group>
        </form>
      )}
    </Modal>
  );
}, 'GoalModal');

export const GoalsTab = reatomComponent(() => {
  const goals = goalsList.data();
  const canManage = planPermissions().manageGoals;

  return (
    <>
      {canManage && (
        <Group justify='flex-end' mb='sm'>
          <Button
            leftSection={<IconPlus size={14} />}
            size='xs'
            onClick={() => editingGoal.set(null)}
          >
            Новая цель
          </Button>
        </Group>
      )}

      {goals.map((goal) => {
        const statusMeta = GOAL_STATUS_META[goal.status];
        const description = asText(goal.description);

        return (
          <Paper withBorder key={goal.id} mb='xs' p='md' radius='md'>
            <Group align='flex-start' gap='xs' wrap='nowrap'>
              <IconTargetArrow opacity={0.5} size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} fz='sm'>
                  {goal.title}
                </Text>
                {description && (
                  <Text c='dimmed' fz='xs' mt={2}>
                    {description}
                  </Text>
                )}
              </div>
              <Badge color='gray' size='sm' variant='light'>
                {getPeriodMeta(goal.period).label}
              </Badge>
              <Badge color={statusMeta.color} size='sm' variant='light'>
                {statusMeta.label}
              </Badge>
              {canManage && (
                <ActionIcon
                  aria-label='Редактировать цель'
                  color='gray'
                  size='sm'
                  variant='subtle'
                  onClick={() => editingGoal.set(goal)}
                >
                  <IconPencil size={14} />
                </ActionIcon>
              )}
            </Group>
          </Paper>
        );
      })}

      {goals.length === 0 && (
        <Text c='dimmed' fz='sm' py='xl' ta='center'>
          Целей пока нет
        </Text>
      )}

      <GoalModal />
    </>
  );
}, 'GoalsTab');
