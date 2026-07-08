import { Button, Group, LoadingOverlay } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconMessagePlus } from '@tabler/icons-react';

import { router } from '@/app/router';

import {
  PersonProgressList,
  SectionTitle,
  StatsGrid
} from '../Dashboard/components/shared/SharedBlocks';
import { dashboard, recruiterDashboard } from '../Dashboard/model';

/**
 * «Мои кандидаты» (рекрутер, PRD §2). Данные — рекрутерский срез общего
 * дашборда (бэкенд ограничивает выборку по recruiter_id). Фидбек кандидату
 * оставляется на странице «Фидбек» — кнопка ведёт туда.
 */
export const Candidates = reatomComponent(() => {
  const data = recruiterDashboard();

  return (
    <div style={{ position: 'relative', minHeight: 120 }}>
      <LoadingOverlay visible={!dashboard.ready()} zIndex={10} />

      {data && (
        <>
          <Group justify='flex-end' mb='md'>
            <Button
              leftSection={<IconMessagePlus size={16} />}
              variant='light'
              onClick={() => router.feedback.go()}
            >
              Оставить фидбек
            </Button>
          </Group>

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

          <SectionTitle>Мои кандидаты</SectionTitle>
          <PersonProgressList items={data.lists.myCandidates} />

          <SectionTitle>Ждут фидбека</SectionTitle>
          <PersonProgressList items={data.lists.feedbackPending} />
        </>
      )}
    </div>
  );
}, 'Candidates');
