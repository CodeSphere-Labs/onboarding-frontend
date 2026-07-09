import type { DashboardTaskItemDto } from '@api';

import { Badge, Group, Paper, Progress, SimpleGrid, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconCircle, IconCircleCheck, IconSpy } from '@tabler/icons-react';

import { router } from '@/app/router';
import { user } from '@/app/user.model';

import { formatGoalPeriodLabel } from '../../../Templates/periods';
import { employeeDashboard } from '../../model';
import { SectionTitle, StatsGrid } from '../shared/SharedBlocks';

import classes from './employeeView.module.css';

const GOAL_STATUS_META = {
  in_progress: { color: 'blue', label: 'В работе' },
  completed: { color: 'green', label: 'Выполнена' },
  cancelled: { color: 'gray', label: 'Отменена' }
} as const;

const periodLabel = (period: string) =>
  period.includes('_') ? formatGoalPeriodLabel(period) : period;

const TaskRow = ({ task }: { task: DashboardTaskItemDto }) => {
  const done = task.status === 'completed';
  const Icon = done ? IconCircleCheck : IconCircle;

  return (
    <Group gap='xs' mb={6} wrap='nowrap'>
      <Icon
        color={done ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-5)'}
        size={16}
        style={{ flexShrink: 0 }}
      />
      <Text
        c={done ? 'dimmed' : undefined}
        flex={1}
        fz={13}
        td={done ? 'line-through' : undefined}
      >
        {task.title}
      </Text>
      {task.isOverdue && (
        <Badge color='red' size='xs' variant='light'>
          Просрочена
        </Badge>
      )}
      <Text c='dimmed' fz={11}>
        {periodLabel(task.period)}
      </Text>
    </Group>
  );
};

export const EmployeeView = reatomComponent(() => {
  const data = employeeDashboard();
  const currentUser = user();

  if (!data || !currentUser) return null;

  const percent = data.plan.progressPercent;
  const previewTasks = [
    ...data.plan.overdueTasks,
    ...data.plan.upcomingTasks,
    ...data.plan.completedTasks
  ].slice(0, 7);

  return (
    <>
      <div className={classes.banner}>
        <div>
          <Text c='white' fw={700} fz={18}>
            Добро пожаловать, {currentUser.firstName} 👋
          </Text>
          <Text c='white' fz='sm' opacity={0.85}>
            {percent >= 50
              ? 'Вы на правильном пути — так держать!'
              : 'Продолжайте выполнять задачи плана — всё получится!'}
          </Text>
        </div>
        <div className={classes.bannerPercent}>{percent}%</div>
      </div>

      <StatsGrid
        items={[
          {
            label: 'Задач выполнено',
            value: `${data.summary.tasksCompleted}/${data.summary.totalTasks}`,
            sub: 'из плана'
          },
          { label: 'Целей поставлено', value: data.summary.goalsCount, sub: 'менеджером' },
          {
            label: 'Достижений',
            value: data.summary.confirmedAchievementsCount,
            sub: 'подтверждено',
            color: 'var(--mantine-color-green-6)'
          },
          {
            label: 'Фидбека получено',
            value: data.summary.feedbackReceivedCount,
            sub: 'от коллег'
          }
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <div>
          <Group justify='space-between' mb='xs' mt='md'>
            <Text fw={700} fz='sm'>
              Мой план задач
            </Text>
            <Text
              c='blue.6'
              fz='xs'
              style={{ cursor: 'pointer' }}
              onClick={() => router.plan.go({ employeeId: undefined })}
            >
              Полный план →
            </Text>
          </Group>
          <Paper withBorder p='md' radius='md'>
            <Group justify='space-between' mb={6}>
              <Text fz={13}>Общий прогресс</Text>
              <Text fw={600} fz={13}>
                {percent}%
              </Text>
            </Group>
            <Progress mb='md' size='md' value={percent} />
            {previewTasks.map((task) => (
              <TaskRow key={task.taskId} task={task} />
            ))}
            {previewTasks.length === 0 && (
              <Text c='dimmed' fz='sm' ta='center'>
                Задач пока нет
              </Text>
            )}
          </Paper>
        </div>

        <div>
          <SectionTitle>Мои цели</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            {data.lists.myGoals.map((goal) => {
              const statusMeta = GOAL_STATUS_META[goal.status];

              return (
                <Group key={goal.goalId} gap='xs' justify='space-between' mb={6} wrap='nowrap'>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={600} fz={13}>
                      {goal.title}
                    </Text>
                    <Text c='dimmed' fz={11}>
                      {periodLabel(goal.period)}
                    </Text>
                  </div>
                  <Badge color={statusMeta.color} size='sm' variant='light'>
                    {statusMeta.label}
                  </Badge>
                </Group>
              );
            })}
            {data.lists.myGoals.length === 0 && (
              <Text c='dimmed' fz='sm' ta='center'>
                Целей пока нет
              </Text>
            )}
          </Paper>

          <SectionTitle>Фидбек</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            {data.lists.recentFeedback.map((item) => (
              <div key={item.feedbackId} className={classes.feedbackItem}>
                <Group gap={6} mb={4}>
                  {/* Автор скрыт: фидбек в MVP анонимный (PRD §3.5) */}
                  <Badge
                    color='gray'
                    leftSection={<IconSpy size={11} />}
                    size='xs'
                    variant='light'
                  >
                    Аноним
                  </Badge>
                  <Text c='dimmed' fz={11} ml='auto'>
                    {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </Group>
                <Text fz={12}>
                  <Text component='span' fw={600}>
                    Хорошо:
                  </Text>{' '}
                  {item.strengths}
                </Text>
                <Text fz={12}>
                  <Text component='span' fw={600}>
                    Улучшить:
                  </Text>{' '}
                  {item.improvements}
                </Text>
              </div>
            ))}
            {data.lists.recentFeedback.length === 0 && (
              <Text c='dimmed' fz='sm' ta='center'>
                Фидбека пока нет
              </Text>
            )}
          </Paper>
        </div>
      </SimpleGrid>
    </>
  );
}, 'EmployeeView');
