import { LoadingOverlay, Paper, SimpleGrid } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import {
  ActivityFeed,
  ChartBars,
  DonutChart,
  SectionTitle,
  StatsGrid
} from '../Dashboard/components/shared/SharedBlocks';
import { dashboard, hrDashboard, recruiterDashboard } from '../Dashboard/model';

const HrAnalytics = reatomComponent(() => {
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
            sub: 'цель: 80%',
            color: 'var(--mantine-color-green-6)'
          },
          {
            label: 'Просроченных',
            value: data.summary.overdueOnboardings,
            color:
              data.summary.overdueOnboardings > 0 ? 'var(--mantine-color-red-6)' : undefined
          },
          { label: 'Ср. прогресс плана', value: `${data.summary.avgPlanProgress}%` }
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
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
        <div>
          <SectionTitle>Последние события</SectionTitle>
          <ActivityFeed items={data.timeline} />
        </div>
      </SimpleGrid>
    </>
  );
}, 'HrAnalytics');

const RecruiterAnalytics = reatomComponent(() => {
  const data = recruiterDashboard();

  if (!data) return null;

  return (
    <>
      <StatsGrid
        items={[
          {
            label: 'Кандидаты в адаптации',
            value: data.summary.myCandidatesInOnboarding
          },
          { label: 'Ср. прогресс', value: `${data.summary.avgCandidateProgress}%` },
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
          <SectionTitle>Статусы кандидатов</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <DonutChart data={data.charts.candidateStatuses} />
          </Paper>
        </div>
        <div>
          <SectionTitle>Распределение прогресса</SectionTitle>
          <Paper withBorder p='md' radius='md'>
            <ChartBars data={data.charts.progressBuckets} />
          </Paper>
        </div>
      </SimpleGrid>
    </>
  );
}, 'RecruiterAnalytics');

/** «Аналитика» — HR и рекрутер (PRD §2), аналитические блоки дашборда */
export const Analytics = reatomComponent(
  () => (
    <div style={{ position: 'relative', minHeight: 120 }}>
      <LoadingOverlay visible={!dashboard.ready()} zIndex={10} />
      <HrAnalytics />
      <RecruiterAnalytics />
    </div>
  ),
  'Analytics'
);
