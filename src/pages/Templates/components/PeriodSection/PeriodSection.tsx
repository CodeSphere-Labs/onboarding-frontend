import type {
  OnboardingTemplatePeriodResponseDto,
  OnboardingTemplateTaskResponseDto
} from '@api';

import { ActionIcon, Alert, Button, Group, Text, TextInput, ThemeIcon } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconAlertTriangle,
  IconCalendar,
  IconChevronDown,
  IconFlag,
  IconPencil,
  IconPlus,
  IconRocket,
  IconTrash,
  IconX
} from '@tabler/icons-react';
import { useState } from 'react';

import {
  addTask,
  asText,
  deleteTask,
  editingTask,
  removePeriod,
  saveTemplateStructure
} from '../../model';
import { formatDayRange, getPeriodColor, periodDurationDays } from '../../periods';

import classes from './periodSection.module.css';

const getPeriodIcon = (period: OnboardingTemplatePeriodResponseDto) => {
  if (period.startDay === 1 && periodDurationDays(period) <= 7) return IconRocket;
  if (period.endDay >= 61) return IconFlag;

  return IconCalendar;
};

const AddTaskRow = reatomComponent(({ periodName }: { periodName: string }) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const confirmAdd = () => {
    if (title.trim()) addTask(periodName, title);
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
      <Button loading={!!saveTemplateStructure.pending()} size='compact-sm' onClick={confirmAdd}>
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

interface Props {
  period: OnboardingTemplatePeriodResponseDto;
  tasks: OnboardingTemplateTaskResponseDto[];
}

export const PeriodSection = reatomComponent<Props>(({ period, tasks }) => {
  const [open, setOpen] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const color = getPeriodColor(period);
  const PeriodIcon = getPeriodIcon(period);

  return (
    <div className={classes.block}>
      <button
        className={classes.header}
        data-open={open || undefined}
        type='button'
        onClick={() => setOpen((value) => !value)}
      >
        <ThemeIcon color={color} radius='md' size={30} variant='light'>
          <PeriodIcon size={16} />
        </ThemeIcon>
        <span className={classes.headerName}>{period.name}</span>
        <Text c='dimmed' fz={11} mr={6}>
          {tasks.length} задач · {formatDayRange(period)}
        </Text>
        <ActionIcon
          aria-label='Удалить период'
          color='red'
          component='span'
          size='sm'
          variant='subtle'
          onClick={(event) => {
            event.stopPropagation();

            if (tasks.length === 0) {
              removePeriod(period);
            } else {
              setConfirmRemove(true);
            }
          }}
        >
          <IconX size={13} />
        </ActionIcon>
        <IconChevronDown className={classes.chevron} size={14} />
      </button>

      {confirmRemove && (
        <Alert color='red' icon={<IconAlertTriangle size={16} />} radius={0}>
          <Group gap='xs' justify='space-between'>
            <Text fz='sm'>Удалить период вместе с задачами ({tasks.length})?</Text>
            <Group gap={6}>
              <Button
                color='red'
                size='compact-xs'
                variant='outline'
                onClick={() => {
                  removePeriod(period);
                  setConfirmRemove(false);
                }}
              >
                Удалить
              </Button>
              <Button size='compact-xs' variant='default' onClick={() => setConfirmRemove(false)}>
                Отмена
              </Button>
            </Group>
          </Group>
        </Alert>
      )}

      {open && (
        <div className={classes.tasksBox}>
          {tasks.map((task) => {
            const description = asText(task.description);

            return (
              <div key={task.id} className={classes.taskRow}>
                <div
                  className={classes.taskDot}
                  style={{ backgroundColor: `var(--mantine-color-${color}-6)` }}
                />
                <div className={classes.taskBody}>
                  <Text fw={500} fz={13} lh={1.4}>
                    {task.title}
                  </Text>
                  {description && (
                    <Text c='dimmed' fz={11}>
                      {description}
                    </Text>
                  )}
                </div>
                <div className={classes.taskActions}>
                  <ActionIcon
                    aria-label='Редактировать задачу'
                    color='gray'
                    size='sm'
                    variant='subtle'
                    onClick={() => editingTask.set(task)}
                  >
                    <IconPencil size={14} />
                  </ActionIcon>
                  <ActionIcon
                    aria-label='Удалить задачу'
                    color='red'
                    size='sm'
                    variant='subtle'
                    onClick={() => deleteTask(task.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </div>
              </div>
            );
          })}
          <AddTaskRow periodName={period.name} />
        </div>
      )}
    </div>
  );
}, 'PeriodSection');
