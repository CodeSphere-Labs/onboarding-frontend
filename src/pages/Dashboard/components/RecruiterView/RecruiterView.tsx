import { Paper, SimpleGrid } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { recruiterDashboard } from '../../model';
import {
  ActivityFeed,
  ChartBars,
  DonutChart,
  PersonProgressList,
  SectionTitle,
  StatsGrid
} from '../shared/SharedBlocks';

export const RecruiterView = reatomComponent(() => {
  const data = recruiterDashboard();

  if (!data) return null;

  return (
    <>
      <StatsGrid
        items={[
          {
            label: 'Мои кандидаты',
            value: data.summary.myCandidatesInOnboarding,
            sub: 'в адаптации'
          },
          {
            label: 'Ср. прогресс',
            value: `${data.summary.avgCandidateProgress}%`,
            sub: 'по плану задач'
          },
          {
            label: 'Ожидают фидбека',
            value: data.summary.feedbackPendingCount,
            color:
              data.summary.feedbackPendingCount > 0
                ? 'var(--mantine-color-orange-6)'
                : undefined
          },
          {
            label: 'Успешных онбордингов',
            value: data.summary.successfulOnboardingsAllTime,
            sub: 'за всё время'
          }
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <div>
          <SectionTitle>Мои кандидаты</SectionTitle>
          <PersonProgressList items={data.lists.myCandidates} />

          <SectionTitle>Ждут фидбека</SectionTitle>
          <PersonProgressList items={data.lists.feedbackPending} />
        </div>

        <div>
          <SectionTitle>Последние события</SectionTitle>
          <ActivityFeed items={data.timeline} />

          <SectionTitle>Статусы кандидатов</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <DonutChart data={data.charts.candidateStatuses} />
          </Paper>

          <SectionTitle>Распределение прогресса</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <ChartBars data={data.charts.progressBuckets} />
          </Paper>
        </div>
      </SimpleGrid>
    </>
  );
}, 'RecruiterView');
