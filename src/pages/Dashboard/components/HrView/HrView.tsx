import { Paper, SimpleGrid, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { hrDashboard } from '../../model';
import {
  ActivityFeed,
  ChartBars,
  DonutChart,
  PersonProgressList,
  SectionTitle,
  StatsGrid
} from '../shared/SharedBlocks';

export const HrView = reatomComponent(() => {
  const data = hrDashboard();

  if (!data) return null;

  return (
    <>
      <StatsGrid
        items={[
          { label: 'Активных онбордингов', value: data.summary.activeOnboardings },
          {
            label: 'Завершены в срок',
            value: data.summary.completedOnTime,
            color: 'var(--mantine-color-green-6)'
          },
          {
            label: 'Под риском',
            value: data.summary.overdueOnboardings,
            sub: data.summary.overdueOnboardings > 0 ? 'Требует внимания' : undefined,
            color:
              data.summary.overdueOnboardings > 0 ? 'var(--mantine-color-red-6)' : undefined
          },
          { label: 'Ср. прогресс плана', value: `${data.summary.avgPlanProgress}%` }
        ]}
      />

      <SectionTitle>Последние онбординги</SectionTitle>
      <PersonProgressList items={data.lists.recentOnboardings} />

      <SectionTitle>Требуют внимания</SectionTitle>
      {data.lists.attentionRequired.length > 0 ? (
        <Paper withBorder p='md' radius='md'>
          {data.lists.attentionRequired.map((item) => (
            <Text key={item.employeeId} fz={13} mb={4}>
              <Text component='span' fw={600}>
                {item.displayName}
              </Text>{' '}
              — {item.reason} (просрочено: {item.overdueTasks}, прогресс {item.progressPercent}%)
            </Text>
          ))}
        </Paper>
      ) : (
        <Paper withBorder p='md' radius='md'>
          <Text c='dimmed' fz='sm' ta='center'>
            Все онбординги идут по плану
          </Text>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} mt='md'>
        <div>
          <SectionTitle>Последние события</SectionTitle>
          <ActivityFeed items={data.timeline} />
        </div>
        <div>
          <SectionTitle>Статусы онбордингов</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <DonutChart data={data.charts.onboardingStatuses} />
          </Paper>
          <SectionTitle>Распределение прогресса</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <ChartBars data={data.charts.progressBuckets} />
          </Paper>
        </div>
      </SimpleGrid>
    </>
  );
}, 'HrView');
