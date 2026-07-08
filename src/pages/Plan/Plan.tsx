import {
  Avatar,
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Progress,
  Select,
  Tabs,
  Text,
  Title
} from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconChecklist,
  IconClipboardOff,
  IconPlus,
  IconTargetArrow,
  IconTrophy,
  IconUserSearch
} from '@tabler/icons-react';

import { user } from '@/app/user.model';

import { getPeriodMeta } from '../Templates/periods';
import { AchievementsTab } from './components/AchievementsTab/AchievementsTab';
import { CreatePlanModal } from './components/CreatePlanModal/CreatePlanModal';
import { GoalsTab } from './components/GoalsTab/GoalsTab';
import { PlanTasksTab } from './components/PlanTasksTab/PlanTasksTab';
import {
  asText,
  employeeOptions,
  hrManagers,
  openCreatePlanModal,
  planData,
  planDayInfo,
  planEmployeeId,
  planPeriods,
  planProgress,
  planTasksByPeriod,
  summarizeTasks,
  templatesForPlan,
  viewedEmployeeId,
  viewedEmployeeName
} from './model';

import classes from './plan.module.css';

const PLAN_STATUS_META = {
  active: { color: 'green', label: 'Активен' },
  completed: { color: 'blue', label: 'Завершён' },
  cancelled: { color: 'gray', label: 'Отменён' }
} as const;

const EmployeePicker = reatomComponent(() => {
  const role = user()?.role;

  if (role === 'employee') return null;

  return (
    <Select
      searchable
      data={employeeOptions.data().map((option) => ({ value: option.id, label: option.name }))}
      placeholder='Выберите сотрудника'
      value={viewedEmployeeId() ?? null}
      w={260}
      onChange={(value) => viewedEmployeeId.set(value ?? undefined)}
    />
  );
}, 'EmployeePicker');

const PlanHeader = reatomComponent(() => {
  const plan = planData.data();

  if (!plan) return null;

  const name = viewedEmployeeName();
  const progress = planProgress();
  const dayInfo = planDayInfo();
  const statusMeta = PLAN_STATUS_META[plan.status];

  return (
    <Paper withBorder mb='md' p='md' radius='md'>
      <Group gap='md' wrap='wrap'>
        <Avatar color='initials' name={name || 'Сотрудник'} size={44} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <Title fw={700} order={5}>
            {name || 'Сотрудник'}
          </Title>
          <Group gap={6} mt={4}>
            {dayInfo && (
              <Badge color='blue' size='sm' variant='light'>
                День {dayInfo.dayNumber}
              </Badge>
            )}
            <Badge color={statusMeta.color} size='sm' variant='light'>
              {statusMeta.label}
            </Badge>
          </Group>
        </div>
        <Group gap='xl'>
          <div>
            <Text fw={700} fz={20} lh={1}>
              {progress.completed}/{progress.total}
            </Text>
            <Text c='dimmed' fz='xs'>
              задач выполнено
            </Text>
          </div>
          <div>
            <Text c='blue.6' fw={700} fz={20} lh={1}>
              {progress.percent}%
            </Text>
            <Text c='dimmed' fz='xs'>
              прогресс плана
            </Text>
          </div>
          {dayInfo && (
            <div>
              <Text fw={700} fz={20} lh={1}>
                {dayInfo.daysLeft}
              </Text>
              <Text c='dimmed' fz='xs'>
                дней осталось
              </Text>
            </div>
          )}
        </Group>
      </Group>
    </Paper>
  );
}, 'PlanHeader');

const PlanSidebar = reatomComponent(() => {
  const plan = planData.data();

  if (!plan) return null;

  const role = user()?.role;
  const progress = planProgress();
  const dayInfo = planDayInfo();
  const tasksByPeriod = planTasksByPeriod();
  const templateId = asText(plan.templateId);
  const templateName =
    role === 'hr' && templateId
      ? templatesForPlan.data().find((template) => template.id === templateId)?.name
      : undefined;
  const manager =
    role === 'hr' ? hrManagers.data().find((item) => item.id === plan.managerId) : undefined;
  const managerName = manager ? `${manager.lastName} ${manager.firstName}`.trim() : undefined;

  return (
    <div>
      <Paper withBorder mb='md' p='md' radius='md' ta='center'>
        <Text c='dimmed' fw={700} fz={11} tt='uppercase'>
          Прогресс плана
        </Text>
        <div className={classes.bigPercent}>{progress.percent}%</div>
        <Group gap='xs' justify='center' mt='sm'>
          <Badge color='green' size='sm' variant='light'>
            {progress.completed} завершено
          </Badge>
          <Badge color='blue' size='sm' variant='light'>
            {progress.inProgress} в работе
          </Badge>
          <Badge color='gray' size='sm' variant='light'>
            {progress.notStarted} не начато
          </Badge>
        </Group>
      </Paper>

      <Paper withBorder mb='md' p='md' radius='md'>
        <Text c='dimmed' fw={700} fz={11} mb='sm' tt='uppercase'>
          По периодам
        </Text>
        {planPeriods().map((period) => {
          const meta = getPeriodMeta(period);
          const periodProgress = summarizeTasks(tasksByPeriod.get(period) ?? []);

          return (
            <Group key={period} gap='xs' mb={6} wrap='nowrap'>
              <Text fz='xs' w={72}>
                {meta.label}
              </Text>
              <Progress color={meta.color} flex={1} size='sm' value={periodProgress.percent} />
              <Text c='dimmed' fz='xs' ta='right' w={34}>
                {periodProgress.percent}%
              </Text>
            </Group>
          );
        })}
      </Paper>

      <Paper withBorder p='md' radius='md'>
        <Text c='dimmed' fw={700} fz={11} mb='sm' tt='uppercase'>
          Информация
        </Text>
        <Group justify='space-between' mb={4}>
          <Text c='dimmed' fz='xs'>
            Дата выхода
          </Text>
          <Text fz='xs'>{new Date(plan.startsAt).toLocaleDateString('ru-RU')}</Text>
        </Group>
        {dayInfo && (
          <Group justify='space-between' mb={4}>
            <Text c='dimmed' fz='xs'>
              День онбординга
            </Text>
            <Text fz='xs'>{dayInfo.dayNumber}</Text>
          </Group>
        )}
        {managerName && (
          <Group justify='space-between' mb={4}>
            <Text c='dimmed' fz='xs'>
              Менеджер
            </Text>
            <Text fz='xs'>{managerName}</Text>
          </Group>
        )}
        {templateName && (
          <Group justify='space-between'>
            <Text c='dimmed' fz='xs'>
              Шаблон
            </Text>
            <Text fz='xs'>{templateName}</Text>
          </Group>
        )}
      </Paper>
    </div>
  );
}, 'PlanSidebar');

export const Plan = reatomComponent(() => {
  const role = user()?.role;
  const employeeId = planEmployeeId();
  const plan = planData.data();
  const canCreate = role === 'hr' || role === 'manager';

  return (
    <>
      <Group justify='space-between' mb='md'>
        <EmployeePicker />
      </Group>

      {!employeeId && role !== 'employee' && (
        <div className={classes.empty}>
          <IconUserSearch opacity={0.3} size={48} />
          <Text fw={600} fz='sm'>
            Выберите сотрудника
          </Text>
          <Text c='dimmed' fz='sm'>
            План онбординга показывается для выбранного сотрудника
          </Text>
        </div>
      )}

      {employeeId && (
        <div style={{ position: 'relative', minHeight: 120 }}>
          <LoadingOverlay visible={!planData.ready()} zIndex={10} />

          {planData.ready() && !plan && (
            <div className={classes.empty}>
              <IconClipboardOff opacity={0.3} size={48} />
              <Text fw={600} fz='sm'>
                Онбординг-плана ещё нет
              </Text>
              <Text c='dimmed' fz='sm'>
                {canCreate
                  ? 'Создайте план из шаблона или с первой задачи'
                  : 'План появится, когда его создаст менеджер или HR'}
              </Text>
              {canCreate && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  mt='sm'
                  onClick={() => openCreatePlanModal()}
                >
                  Создать план
                </Button>
              )}
            </div>
          )}

          {plan && (
            <>
              <PlanHeader />
              <div className={classes.layout}>
                <div>
                  <Tabs defaultValue='tasks' keepMounted={false}>
                    <Tabs.List mb='md'>
                      <Tabs.Tab leftSection={<IconChecklist size={15} />} value='tasks'>
                        План задач
                      </Tabs.Tab>
                      <Tabs.Tab leftSection={<IconTargetArrow size={15} />} value='goals'>
                        Цели
                      </Tabs.Tab>
                      <Tabs.Tab leftSection={<IconTrophy size={15} />} value='achievements'>
                        Достижения
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value='tasks'>
                      <PlanTasksTab />
                    </Tabs.Panel>
                    <Tabs.Panel value='goals'>
                      <GoalsTab />
                    </Tabs.Panel>
                    <Tabs.Panel value='achievements'>
                      <AchievementsTab />
                    </Tabs.Panel>
                  </Tabs>
                </div>
                <PlanSidebar />
              </div>
            </>
          )}
        </div>
      )}

      <CreatePlanModal />
    </>
  );
}, 'Plan');
