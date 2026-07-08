import type { OnboardingPlanResponseDto } from '@api';

import {
  Avatar,
  Badge,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Progress,
  Select,
  Table,
  Text
} from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconListCheck } from '@tabler/icons-react';

import { router } from '@/app/router';

import type { PlanStatusFilter } from './model';

import { asText, viewedEmployeeId } from '../Plan/model';
import {
  departmentNameById,
  fullName,
  page,
  planDayNumber,
  plansList,
  statusFilter,
  summarizeTasks,
  userById
} from './model';

import classes from './onboardings.module.css';

const STATUS_META: Record<OnboardingPlanResponseDto['status'], { color: string; label: string }> =
  {
    active: { color: 'green', label: 'Активен' },
    completed: { color: 'blue', label: 'Завершён' },
    cancelled: { color: 'gray', label: 'Отменён' }
  };

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активен' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' }
];

const PlanRow = reatomComponent(({ plan }: { plan: OnboardingPlanResponseDto }) => {
  const employee = userById().get(plan.employeeId);
  const manager = userById().get(plan.managerId);
  const departmentId = asText(employee?.departmentId);
  const progress = summarizeTasks(plan.tasks);
  const statusMeta = STATUS_META[plan.status];

  return (
    <Table.Tr
      className={classes.row}
      onClick={() => {
        viewedEmployeeId.set(plan.employeeId);
        router.plan.go();
      }}
    >
      <Table.Td>
        <Group gap='xs' wrap='nowrap'>
          <Avatar color='initials' name={fullName(employee)} size={30} />
          <div>
            <Text fw={600} fz='sm'>
              {fullName(employee)}
            </Text>
            <Text c='dimmed' fz='xs'>
              {employee?.email ?? ''}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text c='dimmed' fz='sm'>
          {(departmentId && departmentNameById().get(departmentId)) || '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text c='dimmed' fz='sm'>
          {fullName(manager)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>День {planDayNumber(plan)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={8} wrap='nowrap'>
          <Progress
            color={progress.percent >= 80 ? 'green' : progress.percent >= 50 ? 'blue' : 'red'}
            flex={1}
            miw={80}
            size='sm'
            value={progress.percent}
          />
          <Text c='dimmed' fz='xs' w={34}>
            {progress.percent}%
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={statusMeta.color} size='sm' variant='light'>
          {statusMeta.label}
        </Badge>
      </Table.Td>
    </Table.Tr>
  );
}, 'PlanRow');

export const Onboardings = reatomComponent(() => {
  const list = plansList.data();

  return (
    <>
      <Group justify='space-between' mb='md'>
        <Select
          data={STATUS_FILTER_OPTIONS}
          value={statusFilter()}
          w={170}
          onChange={(value) => {
            statusFilter.set((value ?? 'all') as PlanStatusFilter);
            page.set(1);
          }}
        />
        <Text c='dimmed' fz='xs'>
          {list ? `${list.items.length} из ${list.meta.totalItems}` : ''}
        </Text>
      </Group>

      <Paper withBorder pos='relative' radius='md'>
        <LoadingOverlay visible={!plansList.ready()} zIndex={10} />

        <Table.ScrollContainer minWidth={760}>
          <Table highlightOnHover verticalSpacing='sm'>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Сотрудник</Table.Th>
                <Table.Th>Отдел</Table.Th>
                <Table.Th>Менеджер</Table.Th>
                <Table.Th>День</Table.Th>
                <Table.Th>Прогресс плана</Table.Th>
                <Table.Th>Статус</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list?.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <div className={classes.empty}>
                      <IconListCheck opacity={0.4} size={28} />
                      <Text c='dimmed' fz='sm'>
                        Онбординги не найдены
                      </Text>
                    </div>
                  </Table.Td>
                </Table.Tr>
              )}
              {list?.items.map((plan) => <PlanRow key={plan.id} plan={plan} />)}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {list && list.meta.totalPages > 1 && (
        <Group justify='center' mt='md'>
          <Pagination
            total={list.meta.totalPages}
            value={page()}
            onChange={(nextPage) => page.set(nextPage)}
          />
        </Group>
      )}
    </>
  );
}, 'Onboardings');
