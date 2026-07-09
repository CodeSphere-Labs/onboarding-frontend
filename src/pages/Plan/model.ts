import type {
  AchievementResponseDto,
  GoalResponseDto,
  OnboardingPlanTaskResponseDto
} from '@api';
import type { RequestConfig, RequestOptions } from '@siberiacancode/fetches';

import {
  deleteApiOnboardingPlanByIdTaskByTaskId,
  getApiAchievements,
  getApiDashboard,
  getApiGoals,
  getApiOnboardingPlansEmployeeByEmployeeId,
  getApiOnboardingTemplates,
  getApiUsers,
  patchApiAchievementByIdConfirm,
  patchApiGoalById,
  patchApiOnboardingPlanByIdTaskByTaskId,
  postApiAchievements,
  postApiGoals,
  postApiOnboardingPlanByIdTasks,
  postApiOnboardingPlans
} from '@api';
import { notifications } from '@mantine/notifications';
import {
  abortVar,
  action,
  atom,
  computed,
  reatomBoolean,
  reatomForm,
  withAsync,
  withAsyncData,
  wrap
} from '@reatom/core';
import { z } from 'zod';

import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

// TODO(OSS-16): поднять периоды в shared вместе с переиспользованием компонентов
import type { PeriodRange } from '../Templates/periods';

import { sortPeriodRanges } from '../Templates/periods';

export type TaskStatus = OnboardingPlanTaskResponseDto['status'];

/** Enum-период целей (месяц 1–3 по PRD) — не путать с пользовательскими периодами плана */
export type GoalPeriod = GoalResponseDto['period'];

/** Период плана — снапшот из задач: название + окно в днях от даты выхода */
export interface PlanPeriod extends PeriodRange {
  name: string;
}

/** В сгенерированных DTO nullable-поля типизированы как объект — приводим к строке */
export const asText = (value: unknown) => (typeof value === 'string' ? value : undefined);

const showApiError = (error: unknown) => {
  const apiError = getApiError(error);

  notifications.show({
    title: getErrorCodeMessage(apiError.code),
    message: apiError.message,
    color: 'red'
  });
};

// ── Чей план смотрим ──────────────────────────────────────────────────────

/** Выбор сотрудника для менеджера/HR; сотрудник всегда смотрит свой план */
export const viewedEmployeeId = atom<string | undefined>(undefined, 'plan.viewedEmployeeId');

export const planEmployeeId = computed(() => {
  const currentUser = user();

  if (!currentUser) return undefined;

  return currentUser.role === 'employee' ? currentUser.id : viewedEmployeeId();
}, 'plan.employeeId');

export interface EmployeeOption {
  id: string;
  name: string;
}

/** Полные карточки сотрудников — только HR (users API закрыт для остальных ролей) */
export const hrEmployees = computed(async () => {
  if (user()?.role !== 'hr') return [];

  const response = await wrap(getApiUsers({ query: { role: 'employee', limit: 100 } }));

  return response.data.items;
}, 'plan.hrEmployees').extend(withAsyncData({ initState: [] }));

/** Кандидаты для селектора: HR — все сотрудники (из hrEmployees), менеджер — свои (из дашборда) */
export const employeeOptions = computed(async () => {
  const role = user()?.role;

  if (role === 'hr') {
    return hrEmployees.data().map<EmployeeOption>((item) => ({
      id: item.id,
      name: `${item.lastName} ${item.firstName}`.trim()
    }));
  }

  if (role === 'manager') {
    const response = await wrap(getApiDashboard());
    const dashboard = response.data.dashboard;

    if ('lists' in dashboard && 'myEmployees' in dashboard.lists) {
      return dashboard.lists.myEmployees.map<EmployeeOption>((item) => ({
        id: item.employeeId,
        name: item.displayName
      }));
    }
  }

  return [];
}, 'plan.employeeOptions').extend(withAsyncData({ initState: [] }));

export const hrManagers = computed(async () => {
  if (user()?.role !== 'hr') return [];

  const response = await wrap(getApiUsers({ query: { role: 'manager', limit: 100 } }));

  return response.data.items;
}, 'plan.hrManagers').extend(withAsyncData({ initState: [] }));

// ── План ──────────────────────────────────────────────────────────────────

/** null — у сотрудника ещё нет плана (бэкенд отвечает 404) */
export const planData = computed(async () => {
  const employeeId = planEmployeeId();

  if (!employeeId) return null;

  // 404 без плана — ожидаемый кейс. Без onResponseFailure fetches при
  // зарегистрированном response-интерцепторе (shared/api/session.ts) оставляет
  // «висящий» Promise.reject для пары интерцепторов без onFailure — в консоль
  // летит необработанный ResponseError, хотя catch ниже отрабатывает. Явный
  // onResponseFailure пробрасывает ошибку без unhandled rejection (тот же
  // приём, что и bootstrapAuthConfig в main.tsx). apicraft типизирует config
  // как Partial<RequestConfig>, хотя рантайм fetches читает из него и
  // RequestOptions-колбэки — поэтому тип расширен пересечением.
  const planRequestConfig: Partial<RequestConfig> & RequestOptions = {
    signal: abortVar.require().signal,
    onResponseFailure: (error) => {
      throw error;
    }
  };

  try {
    const response = await wrap(
      getApiOnboardingPlansEmployeeByEmployeeId({
        path: { employeeId },
        config: planRequestConfig
      })
    );

    return response.data.plan;
  } catch (error) {
    if (getApiError(error).code === 'onboarding_plan_not_found') {
      return null;
    }

    throw error;
  }
}, 'plan.data').extend(withAsyncData());

export const planPeriods = computed(() => {
  const plan = planData.data();

  if (!plan) return [];

  const periodByName = new Map<string, PlanPeriod>();

  for (const task of plan.tasks) {
    if (!periodByName.has(task.periodName)) {
      periodByName.set(task.periodName, {
        name: task.periodName,
        startDay: task.periodStartDay,
        endDay: task.periodEndDay
      });
    }
  }

  return sortPeriodRanges([...periodByName.values()]);
}, 'plan.periods');

export const planTasksByPeriod = computed(() => {
  const plan = planData.data();
  const map = new Map<string, OnboardingPlanTaskResponseDto[]>();

  for (const task of plan?.tasks ?? []) {
    const periodTasks = map.get(task.periodName) ?? [];

    periodTasks.push(task);
    map.set(task.periodName, periodTasks);
  }

  return map;
}, 'plan.tasksByPeriod');

export interface ProgressSummary {
  completed: number;
  inProgress: number;
  notStarted: number;
  percent: number;
  total: number;
}

export const summarizeTasks = (tasks: OnboardingPlanTaskResponseDto[]): ProgressSummary => {
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;

  return {
    total: tasks.length,
    completed,
    inProgress,
    notStarted: tasks.length - completed - inProgress,
    percent: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)
  };
};

export const planProgress = computed(
  () => summarizeTasks(planData.data()?.tasks ?? []),
  'plan.progress'
);

const DAY_MS = 24 * 60 * 60 * 1000;
const PROBATION_DAYS = 90;

export const planDayInfo = computed(() => {
  const plan = planData.data();

  if (!plan) return undefined;

  const startMs = new Date(plan.startsAt).getTime();
  const endMs = asText(plan.endsAt)
    ? new Date(asText(plan.endsAt)!).getTime()
    : startMs + PROBATION_DAYS * DAY_MS;
  const dayNumber = Math.max(1, Math.floor((Date.now() - startMs) / DAY_MS) + 1);
  const daysLeft = Math.max(0, Math.ceil((endMs - Date.now()) / DAY_MS));

  return { dayNumber, daysLeft };
}, 'plan.dayInfo');

// ── Права ─────────────────────────────────────────────────────────────────

/** Менеджер редактирует всё в своём плане, HR — структуру, сотрудник — только статусы своих задач */
export const planPermissions = computed(() => {
  const currentUser = user();
  const plan = planData.data();

  if (!currentUser || !plan) {
    return { editStructure: false, toggleStatus: false, manageGoals: false, addAchievement: false, confirmAchievement: false };
  }

  const isPlanManager = currentUser.role === 'manager' && plan.managerId === currentUser.id;
  const isPlanEmployee = currentUser.role === 'employee' && plan.employeeId === currentUser.id;

  return {
    editStructure: currentUser.role === 'hr' || isPlanManager,
    toggleStatus: isPlanManager || isPlanEmployee,
    manageGoals: isPlanManager,
    addAchievement: isPlanManager || isPlanEmployee,
    confirmAchievement: isPlanManager
  };
}, 'plan.permissions');

// ── Мутации задач ─────────────────────────────────────────────────────────

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started'
};

export const cycleTaskStatus = action(async (task: OnboardingPlanTaskResponseDto) => {
  const plan = planData.data();

  if (!plan) return;

  try {
    await wrap(
      patchApiOnboardingPlanByIdTaskByTaskId({
        path: { id: plan.id, taskId: task.id },
        body: { status: STATUS_CYCLE[task.status] }
      })
    );

    planData.retry();
  } catch (error) {
    showApiError(error);
  }
}, 'plan.cycleTaskStatus').extend(withAsync());

export const addPlanTask = action(async (period: PlanPeriod, title: string) => {
  const plan = planData.data();
  const trimmedTitle = title.trim();

  if (!plan || !trimmedTitle) return;

  try {
    await wrap(
      postApiOnboardingPlanByIdTasks({
        path: { id: plan.id },
        body: {
          title: trimmedTitle,
          periodName: period.name,
          periodStartDay: period.startDay,
          periodEndDay: period.endDay
        }
      })
    );

    planData.retry();
  } catch (error) {
    showApiError(error);
  }
}, 'plan.addTask').extend(withAsync());

export const deletePlanTask = action(async (taskId: string) => {
  const plan = planData.data();

  if (!plan) return;

  try {
    await wrap(
      deleteApiOnboardingPlanByIdTaskByTaskId({ path: { id: plan.id, taskId } })
    );

    planData.retry();
    notifications.show({ message: 'Задача удалена', color: 'green' });
  } catch (error) {
    showApiError(error);
  }
}, 'plan.deleteTask').extend(withAsync());

export const editingPlanTask = atom<OnboardingPlanTaskResponseDto | undefined>(
  undefined,
  'plan.editingTask'
);

/** Форма пересоздаётся под редактируемую задачу (computed-фабрика) */
export const planTaskForm = computed(() => {
  const task = editingPlanTask();

  if (!task) return null;

  return reatomForm(
    {
      title: task.title,
      description: asText(task.description) ?? ''
    },
    {
      name: `plan.taskForm#${task.id}`,
      schema: z.object({
        title: z.string().trim().min(2, 'Минимум 2 символа'),
        description: z.string()
      }),
      onSubmit: async (state) => {
        const plan = planData.data();

        if (!plan) return;

        try {
          await wrap(
            patchApiOnboardingPlanByIdTaskByTaskId({
              path: { id: plan.id, taskId: task.id },
              body: {
                title: state.title.trim(),
                description: state.description.trim() || undefined
              }
            })
          );

          planData.retry();
          editingPlanTask.set(undefined);
          notifications.show({ message: 'Задача обновлена', color: 'green' });
        } catch (error) {
          showApiError(error);
        }
      }
    }
  );
}, 'plan.taskForm');

// ── Создание плана (из шаблона) ───────────────────────────────────────────

export const createPlanModalOpened = reatomBoolean(false, 'plan.createModalOpened');

/** Библиотека шаблонов доступна только HR */
export const templatesForPlan = computed(async () => {
  if (user()?.role !== 'hr') return [];

  const response = await wrap(getApiOnboardingTemplates({ query: { limit: 100 } }));

  return response.data.items;
}, 'plan.templates').extend(withAsyncData({ initState: [] }));

export const createPlanForm = reatomForm(
  {
    templateId: '',
    managerId: '',
    startsAt: new Date().toISOString().slice(0, 10),
    firstTaskTitle: ''
  },
  {
    name: 'plan.createForm',
    schema: z
      .object({
        templateId: z.string(),
        managerId: z.string(),
        startsAt: z.string().min(1, 'Укажите дату старта'),
        firstTaskTitle: z.string()
      })
      .refine((state) => state.templateId || state.firstTaskTitle.trim().length >= 2, {
        message: 'Выберите шаблон или введите первую задачу (мин. 2 символа)',
        path: ['firstTaskTitle']
      }),
    onSubmit: async (state) => {
      const employeeId = planEmployeeId();
      const currentUser = user();

      if (!employeeId || !currentUser) return;

      const managerId = currentUser.role === 'manager' ? currentUser.id : state.managerId;

      if (!managerId) {
        notifications.show({ message: 'Выберите менеджера плана', color: 'red' });

        return;
      }

      try {
        await wrap(
          postApiOnboardingPlans({
            body: {
              employeeId,
              managerId,
              startsAt: state.startsAt,
              ...(state.templateId && { templateId: state.templateId }),
              ...(!state.templateId && {
                tasks: [
                  {
                    title: state.firstTaskTitle.trim(),
                    periodName: 'Неделя 1',
                    periodStartDay: 1,
                    periodEndDay: 7,
                    sortOrder: 1
                  }
                ]
              })
            }
          })
        );

        planData.retry();
        createPlanModalOpened.setFalse();
        notifications.show({ message: 'Онбординг-план создан', color: 'green' });
      } catch (error) {
        showApiError(error);
      }
    }
  }
);

export const openCreatePlanModal = action(() => {
  createPlanForm.reset();
  createPlanModalOpened.setTrue();
}, 'plan.openCreateModal');

// ── Цели ──────────────────────────────────────────────────────────────────

export const goalsList = computed(async () => {
  const employeeId = planEmployeeId();

  if (!employeeId) return [];

  const response = await wrap(getApiGoals({ query: { employeeId, limit: 100 } }));

  return response.data.items;
}, 'plan.goals').extend(withAsyncData({ initState: [] }));

/** undefined — модалка закрыта, null — создание, объект — редактирование */
export const editingGoal = atom<GoalResponseDto | null | undefined>(undefined, 'plan.editingGoal');

const GOAL_PERIODS: GoalPeriod[] = ['month_1', 'month_2', 'month_3'];

export const goalForm = computed(() => {
  const goal = editingGoal();

  if (goal === undefined) return null;

  return reatomForm(
    {
      title: goal?.title ?? '',
      description: asText(goal?.description) ?? '',
      period: (goal?.period ?? 'month_1') as string,
      status: (goal?.status ?? 'in_progress') as string
    },
    {
      name: `plan.goalForm#${goal?.id ?? 'new'}`,
      schema: z.object({
        title: z.string().trim().min(2, 'Минимум 2 символа'),
        description: z.string(),
        period: z.string(),
        status: z.string()
      }),
      onSubmit: async (state) => {
        const plan = planData.data();
        const currentUser = user();

        if (!plan || !currentUser) return;

        try {
          if (goal) {
            await wrap(
              patchApiGoalById({
                path: { id: goal.id },
                body: {
                  title: state.title.trim(),
                  description: state.description.trim() || undefined,
                  period: state.period as GoalPeriod,
                  status: state.status as GoalResponseDto['status']
                }
              })
            );
            notifications.show({ message: 'Цель обновлена', color: 'green' });
          } else {
            await wrap(
              postApiGoals({
                body: {
                  employeeId: plan.employeeId,
                  managerId: currentUser.id,
                  title: state.title.trim(),
                  description: state.description.trim() || undefined,
                  period: state.period as GoalPeriod
                }
              })
            );
            notifications.show({ message: 'Цель создана', color: 'green' });
          }

          goalsList.retry();
          editingGoal.set(undefined);
        } catch (error) {
          showApiError(error);
        }
      }
    }
  );
}, 'plan.goalForm');

export { GOAL_PERIODS };

// ── Достижения ────────────────────────────────────────────────────────────

export const achievementsList = computed(async () => {
  const employeeId = planEmployeeId();

  if (!employeeId) return [];

  const response = await wrap(getApiAchievements({ query: { employeeId, limit: 100 } }));

  return response.data.items;
}, 'plan.achievements').extend(withAsyncData({ initState: [] }));

export const achievementModalOpened = reatomBoolean(false, 'plan.achievementModalOpened');

export const achievementForm = reatomForm(
  {
    description: '',
    title: '',
    monthNo: '1',
    goalId: ''
  },
  {
    name: 'plan.achievementForm',
    schema: z.object({
      description: z.string().trim().min(2, 'Опишите достижение'),
      title: z.string(),
      monthNo: z.string(),
      goalId: z.string()
    }),
    onSubmit: async (state) => {
      const plan = planData.data();

      if (!plan) return;

      try {
        await wrap(
          postApiAchievements({
            body: {
              employeeId: plan.employeeId,
              managerId: plan.managerId,
              description: state.description.trim(),
              monthNo: Number(state.monthNo),
              ...(state.title.trim() && { title: state.title.trim() }),
              ...(state.goalId && { goalId: state.goalId })
            }
          })
        );

        achievementsList.retry();
        achievementModalOpened.setFalse();
        notifications.show({ message: 'Достижение добавлено', color: 'green' });
      } catch (error) {
        showApiError(error);
      }
    }
  }
);

export const openAchievementModal = action(() => {
  achievementForm.reset();
  achievementModalOpened.setTrue();
}, 'plan.openAchievementModal');

export const confirmAchievement = action(
  async (achievement: AchievementResponseDto, status: 'confirmed' | 'rejected') => {
    try {
      await wrap(
        patchApiAchievementByIdConfirm({
          path: { id: achievement.id },
          body: { status }
        })
      );

      achievementsList.retry();
      notifications.show({
        message: status === 'confirmed' ? 'Достижение подтверждено' : 'Достижение отклонено',
        color: status === 'confirmed' ? 'green' : 'gray'
      });
    } catch (error) {
      showApiError(error);
    }
  },
  'plan.confirmAchievement'
).extend(withAsync());

// ── Информация о сотруднике для шапки (данные зависят от роли) ────────────

export const viewedEmployeeName = computed(() => {
  const currentUser = user();

  if (!currentUser) return '';

  if (currentUser.role === 'employee') {
    return `${currentUser.lastName} ${currentUser.firstName}`.trim();
  }

  const employeeId = planEmployeeId();

  return employeeOptions.data().find((option) => option.id === employeeId)?.name ?? '';
}, 'plan.viewedEmployeeName');
