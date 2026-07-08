import type { OnboardingTemplateTaskResponseDto } from '@api';

export type OnboardingPeriod = OnboardingTemplateTaskResponseDto['period'];

/** Канонический порядок периодов — зеркало ONBOARDING_PERIODS бэкенда */
export const PERIOD_ORDER: OnboardingPeriod[] = [
  'week_1',
  'week_2',
  'week_3',
  'week_4',
  'week_5',
  'week_6',
  'week_7',
  'week_8',
  'week_9',
  'week_10',
  'week_11',
  'week_12',
  'month_1',
  'month_2',
  'month_3'
];

export interface PeriodMeta {
  color: string;
  group: 'month' | 'week';
  label: string;
  number: number;
  range: string;
}

const MONTH_COLORS = ['violet', 'green', 'teal'];

const MONTH_RANGES = ['Дни 8–30', 'Дни 31–60', 'Дни 61–90'];

export const getPeriodMeta = (period: OnboardingPeriod): PeriodMeta => {
  const [group, rawNumber] = period.split('_') as ['month' | 'week', string];
  const number = Number(rawNumber);

  if (group === 'month') {
    return {
      group,
      number,
      label: `Месяц ${number}`,
      range: MONTH_RANGES[number - 1],
      color: MONTH_COLORS[number - 1]
    };
  }

  return {
    group,
    number,
    label: `Неделя ${number}`,
    range: `Дни ${(number - 1) * 7 + 1}–${number * 7}`,
    color: 'blue'
  };
};

export const sortPeriods = (periods: OnboardingPeriod[]): OnboardingPeriod[] =>
  periods.toSorted((left, right) => PERIOD_ORDER.indexOf(left) - PERIOD_ORDER.indexOf(right));
