import type {
  DashboardActivityItemDto,
  DashboardChartDatumDto,
  DashboardPersonProgressItemDto
} from '@api';

import { Avatar, Badge, Group, Paper, Progress, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconMessageReply,
  IconTargetArrow,
  IconTrophy
} from '@tabler/icons-react';

import { openEmployeePlan } from '../../../Plan/model';

export interface StatCardItem {
  color?: string;
  label: string;
  sub?: string;
  value: number | string;
}

export const StatsGrid = reatomComponent(
  ({ items }: { items: StatCardItem[] }) => (
    <SimpleGrid cols={{ base: 2, md: 4 }} mb='md'>
      {items.map((item) => (
        <Paper withBorder key={item.label} p='md' radius='md'>
          <Text c='dimmed' fz='xs'>
            {item.label}
          </Text>
          <Text fw={700} fz={24} lh={1.2} style={{ color: item.color }}>
            {item.value}
          </Text>
          {item.sub && (
            <Text c='dimmed' fz='xs' mt={2}>
              {item.sub}
            </Text>
          )}
        </Paper>
      ))}
    </SimpleGrid>
  ),
  'StatsGrid'
);

const ACTIVITY_META: Record<
  DashboardActivityItemDto['type'],
  { color: string; icon: typeof IconCircleCheck }
> = {
  task_completed: { color: 'green', icon: IconCircleCheck },
  feedback_added: { color: 'teal', icon: IconMessageReply },
  goal_added: { color: 'violet', icon: IconTargetArrow },
  achievement_confirmed: { color: 'yellow', icon: IconTrophy },
  task_overdue: { color: 'red', icon: IconAlertTriangle }
};

export const ActivityFeed = reatomComponent(
  ({ items }: { items: DashboardActivityItemDto[] }) => (
    <Paper withBorder p='md' radius='md'>
      {items.map((item, index) => {
        const meta = ACTIVITY_META[item.type];
        const description =
          typeof item.description === 'string' ? item.description : undefined;

        return (
          <Group
            key={item.id}
            align='flex-start'
            gap='xs'
            mb={index === items.length - 1 ? 0 : 'sm'}
            wrap='nowrap'
          >
            <ThemeIcon color={meta.color} radius='xl' size={30} variant='light'>
              <meta.icon size={16} />
            </ThemeIcon>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text fz={13}>{item.title}</Text>
              {description && (
                <Text c='dimmed' fz={12}>
                  {description}
                </Text>
              )}
              <Text c='dimmed' fz={11}>
                {new Date(item.occurredAt).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </div>
          </Group>
        );
      })}
      {items.length === 0 && (
        <Text c='dimmed' fz='sm' py='md' ta='center'>
          Событий пока нет
        </Text>
      )}
    </Paper>
  ),
  'ActivityFeed'
);

const progressColor = (percent: number) =>
  percent >= 80 ? 'green' : percent >= 50 ? 'blue' : 'red';

/** Строка «человек + прогресс»; клик ведёт на план сотрудника */
export const PersonProgressList = reatomComponent(
  ({ items }: { items: DashboardPersonProgressItemDto[] }) => (
    <Paper withBorder p='md' radius='md'>
      {items.map((item) => (
        <Group
          key={item.employeeId}
          gap='xs'
          mb='sm'
          style={{ cursor: 'pointer' }}
          wrap='nowrap'
          onClick={() => openEmployeePlan(item.employeeId)}
        >
          <Avatar color='initials' name={item.displayName} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} fz={13}>
              {item.displayName}
            </Text>
            <Text c='dimmed' fz={11}>
              с {new Date(item.startDate).toLocaleDateString('ru-RU')}
              {item.overdueTasks > 0 && ` · просрочено: ${item.overdueTasks}`}
            </Text>
          </div>
          <div style={{ width: 110 }}>
            <Text fz={11} mb={3} ta='right'>
              {item.progressPercent}%
            </Text>
            <Progress
              color={progressColor(item.progressPercent)}
              size='sm'
              value={item.progressPercent}
            />
          </div>
        </Group>
      ))}
      {items.length === 0 && (
        <Text c='dimmed' fz='sm' py='md' ta='center'>
          Пока пусто
        </Text>
      )}
    </Paper>
  ),
  'PersonProgressList'
);

const CHART_COLORS = ['#228be6', '#fa5252', '#40c057', '#7950f2', '#fd7e14', '#15aabf'];

export const DonutChart = reatomComponent(
  ({ data }: { data: DashboardChartDatumDto[] }) => {
    const total = data.reduce((sum, datum) => sum + datum.value, 0);

    if (total === 0) {
      return (
        <Text c='dimmed' fz='sm' py='md' ta='center'>
          Нет данных
        </Text>
      );
    }

    let angle = -90;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const slices = data
      .filter((datum) => datum.value > 0)
      .map((datum, index) => {
        const sweep = (datum.value / total) * 360;
        const r = 52;
        const cx = 60;
        const cy = 60;
        const x1 = cx + r * Math.cos(toRad(angle));
        const y1 = cy + r * Math.sin(toRad(angle));

        angle += Math.min(sweep, 359.9);

        const x2 = cx + r * Math.cos(toRad(angle));
        const y2 = cy + r * Math.sin(toRad(angle));
        const large = sweep > 180 ? 1 : 0;

        return {
          path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
          color: CHART_COLORS[index % CHART_COLORS.length],
          label: datum.label,
          value: datum.value
        };
      });

    return (
      <Group align='center' gap='lg'>
        <svg height={120} width={120}>
          {slices.map((slice) => (
            <path key={slice.label} d={slice.path} fill={slice.color} />
          ))}
          <circle cx={60} cy={60} fill='var(--mantine-color-body)' r={30} />
          <text
            fill='var(--mantine-color-text)'
            fontSize={14}
            fontWeight={700}
            textAnchor='middle'
            x={60}
            y={64}
          >
            {total}
          </text>
        </svg>
        <div>
          {slices.map((slice) => (
            <Group key={slice.label} gap={6} mb={4}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: slice.color,
                  display: 'inline-block'
                }}
              />
              <Text fz={12}>
                {slice.label} ({slice.value})
              </Text>
            </Group>
          ))}
        </div>
      </Group>
    );
  },
  'DonutChart'
);

export const ChartBars = reatomComponent(
  ({ data }: { data: DashboardChartDatumDto[] }) => {
    const max = Math.max(1, ...data.map((datum) => datum.value));

    return (
      <>
        {data.map((datum) => (
          <div key={datum.label} style={{ marginBottom: 8 }}>
            <Group justify='space-between' mb={3}>
              <Text fz={12}>{datum.label}</Text>
              <Text fw={600} fz={12}>
                {datum.value}
              </Text>
            </Group>
            <Progress size='sm' value={(datum.value / max) * 100} />
          </div>
        ))}
        {data.length === 0 && (
          <Text c='dimmed' fz='sm' py='md' ta='center'>
            Нет данных
          </Text>
        )}
      </>
    );
  },
  'ChartBars'
);

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text fw={700} fz='sm' mb='xs' mt='md'>
    {children}
  </Text>
);

export { Badge as StatusBadge };
