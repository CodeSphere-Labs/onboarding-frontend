import type { OnboardingPlanTaskResponseDto } from '@api';
import type { SubmitEventHandler } from 'react';

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Progress,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import {
  IconCalendar,
  IconCircle,
  IconCircleCheck,
  IconCircleHalf2,
  IconPencil,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { useState } from 'react';

// TODO(OSS-16): периоды переедут в shared при выделении страниц целей/достижений
import type { PlanPeriod, TaskStatus } from '../../model';

import { formatDayRange, getPeriodColor } from '../../../Templates/periods';
import {
  addPlanTask,
  asText,
  cycleTaskStatus,
  deletePlanTask,
  editingPlanTask,
  planPeriods,
  planPermissions,
  planTaskForm,
  planTasksByPeriod,
  summarizeTasks
} from '../../model';
import { AddPlanPeriodButton } from '../AddPlanPeriodModal/AddPlanPeriodModal';

import classes from './planTasksTab.module.css';

const STATUS_META: Record<TaskStatus, { color: string; icon: typeof IconCircle; label: string }> = {
  not_started: { color: 'gray', label: 'Не начато', icon: IconCircle },
  in_progress: { color: 'blue', label: 'В работе', icon: IconCircleHalf2 },
  completed: { color: 'green', label: 'Завершено', icon: IconCircleCheck }
};

const TaskStatusControl = reatomComponent(
  ({ task }: { task: OnboardingPlanTaskResponseDto }) => {
    const meta = STATUS_META[task.status];
    const canToggle = planPermissions().toggleStatus;

    return (
      <Tooltip disabled={!canToggle} label={`${meta.label} → сменить`} openDelay={400}>
        <ActionIcon
          aria-label={`Статус: ${meta.label}`}
          color={meta.color}
          disabled={!canToggle}
          loading={!!cycleTaskStatus.pending()}
          size='md'
          variant='subtle'
          onClick={() => canToggle && cycleTaskStatus(task)}
        >
          <meta.icon size={20} />
        </ActionIcon>
      </Tooltip>
    );
  },
  'TaskStatusControl'
);

const AddTaskRow = reatomComponent(({ period }: { period: PlanPeriod }) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const confirmAdd = () => {
    if (title.trim()) addPlanTask(period, title);
    setTitle('');
    setAdding(false);
  };

  if (!adding) {
    return (
      <button className={classes.addTaskRow} type='button' onClick={() => setAdding(true)}>
        <IconPlus size={15} />
        Добавить задачу
      </button>
    );
  }

  return (
    <Group className={classes.addTaskForm} gap='xs' wrap='nowrap'>
      <TextInput
        autoFocus
        flex={1}
        placeholder='Название задачи…'
        size='xs'
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') confirmAdd();
          if (event.key === 'Escape') {
            setAdding(false);
            setTitle('');
          }
        }}
      />
      <Button loading={!!addPlanTask.pending()} size='compact-sm' onClick={confirmAdd}>
        Добавить
      </Button>
      <Button
        size='compact-sm'
        variant='default'
        onClick={() => {
          setAdding(false);
          setTitle('');
        }}
      >
        Отмена
      </Button>
    </Group>
  );
}, 'AddTaskRow');

const TaskRow = reatomComponent(({ task }: { task: OnboardingPlanTaskResponseDto }) => {
  const meta = STATUS_META[task.status];
  const description = asText(task.description);
  const canEdit = planPermissions().editStructure;

  return (
    <div className={classes.taskRow}>
      <TaskStatusControl task={task} />
      <div className={classes.taskBody}>
        <Text
          className={task.status === 'completed' ? classes.taskTitleDone : undefined}
          fw={500}
          fz={13}
          lh={1.4}
        >
          {task.title}
        </Text>
        {description && (
          <Text c='dimmed' fz={11}>
            {description}
          </Text>
        )}
      </div>
      <Badge color={meta.color} size='sm' variant='light'>
        {meta.label}
      </Badge>
      {canEdit && (
        <div className={classes.taskActions}>
          <ActionIcon
            aria-label='Редактировать задачу'
            color='gray'
            size='sm'
            variant='subtle'
            onClick={() => editingPlanTask.set(task)}
          >
            <IconPencil size={14} />
          </ActionIcon>
          <ActionIcon
            aria-label='Удалить задачу'
            color='red'
            size='sm'
            variant='subtle'
            onClick={() => deletePlanTask(task.id)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </div>
      )}
    </div>
  );
}, 'TaskRow');

const PlanTaskModal = reatomComponent(() => {
  const form = planTaskForm();

  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault();
    form?.submit();
  };

  return (
    <Modal
      centered
      opened={!!editingPlanTask()}
      title='Редактировать задачу'
      onClose={() => editingPlanTask.set(undefined)}
    >
      {form && (
        <form onSubmit={handleSubmit}>
          <TextInput
            data-autofocus
            withAsterisk
            label='Название'
            placeholder='Что нужно сделать'
            {...bindField(form.fields.title)}
          />
          <Textarea
            label='Описание'
            mt='sm'
            placeholder='Дополнительные детали…'
            rows={3}
            {...bindField(form.fields.description)}
          />
          <Group justify='flex-end' mt='lg'>
            <Button variant='default' onClick={() => editingPlanTask.set(undefined)}>
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
}, 'PlanTaskModal');

export const PlanTasksTab = reatomComponent(() => {
  const periods = planPeriods();
  const tasksByPeriod = planTasksByPeriod();
  const canEdit = planPermissions().editStructure;

  return (
    <>
      {canEdit && (
        <Group justify='flex-end' mb='sm'>
          <AddPlanPeriodButton />
        </Group>
      )}

      {periods.map((period) => {
        const color = getPeriodColor(period);
        const tasks = tasksByPeriod.get(period.name) ?? [];
        const progress = summarizeTasks(tasks);

        return (
          <Paper withBorder key={period.name} mb='md' radius='md' style={{ overflow: 'hidden' }}>
            <Group gap={10} p='sm' wrap='nowrap'>
              <ThemeIcon color={color} radius='md' size={30} variant='light'>
                <IconCalendar size={16} />
              </ThemeIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} fz={13}>
                  {period.name}
                </Text>
                <Text c='dimmed' fz={11}>
                  {formatDayRange(period)}
                </Text>
              </div>
              <Text c='dimmed' fz={12}>
                {progress.completed}/{progress.total} · {progress.percent}%
              </Text>
              <Progress color={color} size='sm' value={progress.percent} w={120} />
            </Group>
            <div>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              {canEdit && <AddTaskRow period={period} />}
            </div>
          </Paper>
        );
      })}

      {periods.length === 0 && (
        <Text c='dimmed' fz='sm' py='xl' ta='center'>
          В плане пока нет задач{canEdit && ' — добавьте период с первой задачей'}
        </Text>
      )}

      <PlanTaskModal />
    </>
  );
}, 'PlanTasksTab');
