import { Badge, LoadingOverlay, Paper, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { PersonProgressList, SectionTitle, StatsGrid } from '../Dashboard/components/shared/SharedBlocks';
import { dashboard, managerDashboard } from '../Dashboard/model';

/**
 * «Мои сотрудники» (менеджер, PRD §2 «Просмотр своих сотрудников»).
 * Данные — менеджерский срез общего дашборда; клик по сотруднику
 * открывает его план (общий selected-employee).
 */
export const Employees = reatomComponent(() => {
  const data = managerDashboard();

  return (
    <div style={{ position: 'relative', minHeight: 120 }}>
      <LoadingOverlay visible={!dashboard.ready()} zIndex={10} />

      {data && (
        <>
          <StatsGrid
            items={[
              { label: 'Сотрудников в команде', value: data.summary.teamSize },
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

          <SectionTitle>Мои сотрудники</SectionTitle>
          <PersonProgressList items={data.lists.myEmployees} />

          <SectionTitle>Под риском</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            {data.lists.atRiskEmployees.map((item) => (
              <Text key={item.employeeId} fz={13} mb={4}>
                <Text component='span' fw={600}>
                  {item.displayName}
                </Text>{' '}
                — {item.reason}{' '}
                <Badge color='red' size='xs' variant='light'>
                  просрочено: {item.overdueTasks}
                </Badge>
              </Text>
            ))}
            {data.lists.atRiskEmployees.length === 0 && (
              <Text c='dimmed' fz='sm' ta='center'>
                Рисков нет — команда идёт по плану
              </Text>
            )}
          </Paper>
        </>
      )}
    </div>
  );
}, 'Employees');
