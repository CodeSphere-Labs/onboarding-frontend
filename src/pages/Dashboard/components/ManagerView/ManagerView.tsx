import { Badge, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { getPeriodMeta } from '../../../Templates/periods';
import { managerDashboard } from '../../model';
import {
  ActivityFeed,
  ChartBars,
  DonutChart,
  PersonProgressList,
  SectionTitle,
  StatsGrid
} from '../shared/SharedBlocks';

const GOAL_STATUS_META = {
  in_progress: { color: 'blue', label: 'В работе' },
  completed: { color: 'green', label: 'Выполнена' },
  cancelled: { color: 'gray', label: 'Отменена' }
} as const;

export const ManagerView = reatomComponent(() => {
  const data = managerDashboard();

  if (!data) return null;

  return (
    <>
      <StatsGrid
        items={[
          { label: 'Мои сотрудники', value: data.summary.teamSize, sub: 'в команде' },
          { label: 'Активных планов', value: data.summary.activePlans },
          { label: 'Целей в работе', value: data.summary.goalsInProgress },
          {
            label: 'Достижения на подтверждении',
            value: data.summary.pendingAchievementsApproval,
            color:
              data.summary.pendingAchievementsApproval > 0
                ? 'var(--mantine-color-orange-6)'
                : undefined
          }
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <div>
          <SectionTitle>Мои сотрудники</SectionTitle>
          <PersonProgressList items={data.lists.myEmployees} />

          <SectionTitle>Под риском</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            {data.lists.atRiskEmployees.map((item) => (
              <Text key={item.employeeId} fz={13} mb={4}>
                <Text component='span' fw={600}>
                  {item.displayName}
                </Text>{' '}
                — {item.reason}
              </Text>
            ))}
            {data.lists.atRiskEmployees.length === 0 && (
              <Text c='dimmed' fz='sm' ta='center'>
                Рисков нет
              </Text>
            )}
          </Paper>
        </div>

        <div>
          <SectionTitle>Активность команды</SectionTitle>
          <ActivityFeed items={data.timeline} />
        </div>
      </SimpleGrid>

      <SectionTitle>Цели сотрудников</SectionTitle>
      <Paper withBorder p='md' radius='md'>
        {data.lists.employeesGoals.map((goal) => {
          const statusMeta = GOAL_STATUS_META[goal.status];
          const periodLabel = goal.period.includes('_')
            ? getPeriodMeta(goal.period as Parameters<typeof getPeriodMeta>[0]).label
            : goal.period;

          return (
            <Group key={goal.goalId} gap='xs' justify='space-between' mb={6} wrap='nowrap'>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} fz={13}>
                  {goal.title}
                </Text>
                <Text c='dimmed' fz={11}>
                  {goal.employeeName}
                </Text>
              </div>
              <Badge color='gray' size='sm' variant='light'>
                {periodLabel}
              </Badge>
              <Badge color={statusMeta.color} size='sm' variant='light'>
                {statusMeta.label}
              </Badge>
            </Group>
          );
        })}
        {data.lists.employeesGoals.length === 0 && (
          <Text c='dimmed' fz='sm' ta='center'>
            Целей пока нет
          </Text>
        )}
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} mt='md'>
        <div>
          <SectionTitle>Прогресс команды</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <ChartBars data={data.charts.teamProgress} />
          </Paper>
        </div>
        <div>
          <SectionTitle>Статусы целей</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <DonutChart data={data.charts.goalsStatuses} />
          </Paper>
        </div>
      </SimpleGrid>
    </>
  );
}, 'ManagerView');
