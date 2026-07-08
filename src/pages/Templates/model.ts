import type {
  OnboardingTemplateResponseDto,
  OnboardingTemplateTaskResponseDto,
  TemplateTaskDto
} from '@api';

import {
  getApiOnboardingTemplates,
  getApiOrgDepartments,
  patchApiOnboardingTemplateById,
  postApiOnboardingTemplates
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

import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

import type { OnboardingPeriod } from './periods';

import { getPeriodMeta, sortPeriods } from './periods';

/** В сгенерированных DTO nullable-поля типизированы как объект — приводим к строке */
export const asText = (value: unknown) => (typeof value === 'string' ? value : undefined);

/** Задача в форме, пригодной для PATCH-тела (sortOrder проставляется при сохранении) */
interface TemplateTaskInput {
  description?: string;
  period: OnboardingPeriod;
  title: string;
}

const showApiError = (error: unknown) => {
  const apiError = getApiError(error);

  notifications.show({
    title: getErrorCodeMessage(apiError.code),
    message: apiError.message,
    color: 'red'
  });
};

const toTaskInputs = (tasks: OnboardingTemplateTaskResponseDto[]): TemplateTaskInput[] =>
  tasks.map((task) => ({
    title: task.title,
    description: asText(task.description),
    period: task.period
  }));

/** Бэкенд требует уникальный sortOrder внутри периода — нумеруем по порядку следования */
const withSortOrder = (tasks: TemplateTaskInput[]): TemplateTaskDto[] => {
  const counters = new Map<OnboardingPeriod, number>();

  return tasks.map((task) => {
    const nextOrder = (counters.get(task.period) ?? 0) + 1;

    counters.set(task.period, nextOrder);

    return { ...task, sortOrder: nextOrder };
  });
};

// ── Список шаблонов ───────────────────────────────────────────────────────

export const searchQuery = atom('', 'templates.searchQuery');

export const templatesList = computed(async () => {
  const response = await wrap(
    getApiOnboardingTemplates({
      query: { limit: 100, sortBy: 'name', sortOrder: 'asc' },
      config: { signal: abortVar.require().signal }
    })
  );

  return response.data.items;
}, 'templates.list').extend(withAsyncData({ initState: [] }));

export const departments = computed(async () => {
  const response = await wrap(getApiOrgDepartments({ query: { limit: 100 } }));

  return response.data.items;
}, 'templates.departments').extend(withAsyncData({ initState: [] }));

export const departmentNameById = computed(
  () => new Map(departments.data().map((item) => [item.id, item.name])),
  'templates.departmentNameById'
);

/** Чистый хелпер на простых данных: реактивное чтение словаря остаётся на вызывающей стороне */
export const templateDepartmentName = (
  template: OnboardingTemplateResponseDto,
  departmentNames: Map<string, string>
) => {
  const departmentId = asText(template.departmentId);

  return (departmentId && departmentNames.get(departmentId)) || undefined;
};

const WITHOUT_DEPARTMENT_GROUP = 'Без отдела';

/** Список для левой панели: фильтр по поиску + группировка по отделам */
export const groupedTemplates = computed(() => {
  const query = searchQuery().trim().toLowerCase();

  const matchingTemplates = templatesList.data().filter((template) => {
    if (!query) return true;

    return [
      template.name,
      asText(template.description),
      templateDepartmentName(template, departmentNameById())
    ].some((value) => value?.toLowerCase().includes(query));
  });

  const groups = new Map<string, OnboardingTemplateResponseDto[]>();

  for (const template of matchingTemplates) {
    const groupName =
      templateDepartmentName(template, departmentNameById()) ?? WITHOUT_DEPARTMENT_GROUP;
    const group = groups.get(groupName) ?? [];

    group.push(template);
    groups.set(groupName, group);
  }

  return [...groups.entries()].toSorted(([left], [right]) => left.localeCompare(right, 'ru'));
}, 'templates.grouped');

// ── Выбранный шаблон ──────────────────────────────────────────────────────

export const selectedTemplateId = atom<string | undefined>(undefined, 'templates.selectedId');

export const selectedTemplate = computed(
  () => templatesList.data().find((template) => template.id === selectedTemplateId()),
  'templates.selected'
);

/**
 * Периодов как сущности на бэке нет — они выводятся из задач. Пустые периоды,
 * добавленные через «Добавить период», живут только в UI, пока в них не появится задача.
 */
const extraPeriods = atom<Record<string, OnboardingPeriod[]>>({}, 'templates.extraPeriods');

export const templatePeriods = computed(() => {
  const template = selectedTemplate();

  if (!template) return [];

  const periodsFromTasks = template.tasks.map((task) => task.period);
  const uiOnlyPeriods = extraPeriods()[template.id] ?? [];

  return sortPeriods([...new Set([...periodsFromTasks, ...uiOnlyPeriods])]);
}, 'templates.periods');

export const tasksByPeriod = computed(() => {
  const template = selectedTemplate();
  const map = new Map<OnboardingPeriod, OnboardingTemplateTaskResponseDto[]>();

  for (const task of template?.tasks ?? []) {
    const periodTasks = map.get(task.period) ?? [];

    periodTasks.push(task);
    map.set(task.period, periodTasks);
  }

  return map;
}, 'templates.tasksByPeriod');

// ── Мутации задач ─────────────────────────────────────────────────────────

export const saveTemplateTasks = action(
  async (
    template: OnboardingTemplateResponseDto,
    nextTasks: TemplateTaskInput[],
    successMessage?: string
  ) => {
    try {
      await wrap(
        patchApiOnboardingTemplateById({
          path: { id: template.id },
          body: { tasks: withSortOrder(nextTasks) }
        })
      );

      templatesList.retry();

      if (successMessage) {
        notifications.show({ message: successMessage, color: 'green' });
      }
    } catch (error) {
      showApiError(error);
    }
  },
  'templates.saveTasks'
).extend(withAsync());

export const addTask = action((period: OnboardingPeriod, title: string) => {
  const template = selectedTemplate();
  const trimmedTitle = title.trim();

  if (!template || !trimmedTitle) return;

  saveTemplateTasks(template, [...toTaskInputs(template.tasks), { title: trimmedTitle, period }]);
}, 'templates.addTask');

export const deleteTask = action((taskId: string) => {
  const template = selectedTemplate();

  if (!template) return;

  saveTemplateTasks(
    template,
    toTaskInputs(template.tasks.filter((task) => task.id !== taskId)),
    'Задача удалена'
  );
}, 'templates.deleteTask');

// ── Редактирование задачи (модалка) ───────────────────────────────────────

export const editingTask = atom<OnboardingTemplateTaskResponseDto | undefined>(
  undefined,
  'templates.editingTask'
);

/** Форма пересоздаётся под редактируемую задачу (computed-фабрика, как editUserForm в Users) */
export const taskForm = computed(() => {
  const task = editingTask();

  if (!task) return null;

  return reatomForm(
    {
      title: task.title,
      description: asText(task.description) ?? ''
    },
    {
      name: `templates.taskForm#${task.id}`,
      schema: z.object({
        title: z.string().trim().min(2, 'Минимум 2 символа'),
        description: z.string()
      }),
      onSubmit: async (state) => {
        const template = selectedTemplate();

        if (!template) return;

        const nextTasks = toTaskInputs(template.tasks).map((input, index) =>
          template.tasks[index].id === task.id
            ? {
                title: state.title.trim(),
                description: state.description.trim() || undefined,
                period: input.period
              }
            : input
        );

        await wrap(saveTemplateTasks(template, nextTasks, 'Задача обновлена'));
        editingTask.set(undefined);
      }
    }
  );
}, 'templates.taskForm');

// ── Периоды ───────────────────────────────────────────────────────────────

export const addPeriod = action((period: OnboardingPeriod) => {
  const template = selectedTemplate();

  if (!template) return;

  extraPeriods.set((prev) => ({
    ...prev,
    [template.id]: [...(prev[template.id] ?? []), period]
  }));
  notifications.show({
    message: `Период «${getPeriodMeta(period).label}» добавлен`,
    color: 'green'
  });
}, 'templates.addPeriod');

export const removePeriod = action((period: OnboardingPeriod) => {
  const template = selectedTemplate();

  if (!template) return;

  extraPeriods.set((prev) => ({
    ...prev,
    [template.id]: (prev[template.id] ?? []).filter((item) => item !== period)
  }));

  const remainingTasks = template.tasks.filter((task) => task.period !== period);

  if (remainingTasks.length !== template.tasks.length) {
    saveTemplateTasks(template, toTaskInputs(remainingTasks), 'Период удалён');
  } else {
    notifications.show({ message: 'Период удалён', color: 'gray' });
  }
}, 'templates.removePeriod');

// ── Создание и дублирование шаблона ───────────────────────────────────────

export const createModalOpened = reatomBoolean(false, 'templates.createModalOpened');

export const createTemplateForm = reatomForm(
  {
    name: '',
    departmentId: '',
    description: ''
  },
  {
    name: 'templates.createForm',
    schema: z.object({
      name: z.string().trim().min(2, 'Минимум 2 символа'),
      departmentId: z.string(),
      description: z.string()
    }),
    onSubmit: async (state) => {
      try {
        const response = await wrap(
          postApiOnboardingTemplates({
            body: {
              name: state.name.trim(),
              ...(state.description.trim() && { description: state.description.trim() }),
              ...(state.departmentId && { departmentId: state.departmentId }),
              tasks: []
            }
          })
        );

        const createdTemplate = response.data.template as
          | typeof response.data.template
          | null;

        templatesList.retry();

        if (!createdTemplate) {
          notifications.show({ message: 'Сервер не вернул созданный шаблон', color: 'red' });

          return;
        }

        selectedTemplateId.set(createdTemplate.id);
        createModalOpened.setFalse();
        notifications.show({
          message: `Шаблон «${createdTemplate.name}» создан — добавьте периоды`,
          color: 'green'
        });
      } catch (error) {
        showApiError(error);
      }
    }
  }
);

export const openCreateModal = action(() => {
  createTemplateForm.reset();
  createModalOpened.setTrue();
}, 'templates.openCreateModal');

export const duplicateTemplate = action(async () => {
  const template = selectedTemplate();

  if (!template) return;

  try {
    const response = await wrap(
      postApiOnboardingTemplates({
        body: {
          name: `${template.name} (копия)`,
          description: asText(template.description),
          departmentId: asText(template.departmentId),
          positionId: asText(template.positionId),
          tasks: withSortOrder(toTaskInputs(template.tasks))
        }
      })
    );

    const createdTemplate = response.data.template as
      | typeof response.data.template
      | null;

    templatesList.retry();

    if (!createdTemplate) {
      notifications.show({ message: 'Сервер не вернул созданный шаблон', color: 'red' });

      return;
    }

    selectedTemplateId.set(createdTemplate.id);
    notifications.show({ message: 'Шаблон продублирован', color: 'green' });
  } catch (error) {
    showApiError(error);
  }
}, 'templates.duplicate').extend(withAsync());
