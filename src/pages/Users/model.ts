import type { CreateUserResponseDto, UpdateUserDto, UserResponseDto } from '@api';

import {
  getApiOrgDepartments,
  getApiOrgPositions,
  getApiUsers,
  patchApiUserById,
  patchApiUserByIdDeactivate,
  postApiUsers
} from '@api';
import { notifications } from '@mantine/notifications';
import {
  action,
  atom,
  computed,
  reatomBoolean,
  reatomForm,
  sleep,
  withAsync,
  withAsyncData,
  wrap
} from '@reatom/core';
import { z } from 'zod';

import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

export type UserRoleFilter = 'all' | UserResponseDto['role'];
export type UserStatusFilter = 'all' | UserResponseDto['employmentStatus'];
export type UsersSortBy = 'createdAt' | 'lastName' | 'startDate';

const PAGE_LIMIT = 20;

/** В сгенерированных DTO nullable-поля типизированы как объект — приводим к строке */
export const asId = (value: unknown) => (typeof value === 'string' ? value : undefined);

/** Обратное приведение для PATCH-тела: пустая строка → null в nullable-поле DTO */
const toNullableDtoValue = (value: string) => (value || null) as UpdateUserDto['departmentId'];

export const fullName = (user: Pick<UserResponseDto, 'firstName' | 'lastName'>) =>
  `${user.lastName} ${user.firstName}`.trim();

// ── Фильтры и сортировка ──────────────────────────────────────────────────

export const searchQuery = atom('', 'users.searchQuery');
export const roleFilter = atom<UserRoleFilter>('all', 'users.roleFilter');
export const statusFilter = atom<UserStatusFilter>('all', 'users.statusFilter');
export const departmentFilter = atom<string>('all', 'users.departmentFilter');
export const page = atom(1, 'users.page');
export const sortBy = atom<UsersSortBy>('lastName', 'users.sortBy');
export const sortOrder = atom<'asc' | 'desc'>('asc', 'users.sortOrder');

export const toggleSort = (nextSortBy: UsersSortBy) => {
  if (sortBy() === nextSortBy) {
    sortOrder.set((order) => (order === 'asc' ? 'desc' : 'asc'));
  } else {
    sortBy.set(nextSortBy);
    sortOrder.set('asc');
  }
  page.set(1);
};

// ── Список пользователей ──────────────────────────────────────────────────

export const usersList = computed(async () => {
  const query = {
    page: page(),
    limit: PAGE_LIMIT,
    sortBy: sortBy(),
    sortOrder: sortOrder(),
    ...(searchQuery().trim() && { search: searchQuery().trim() }),
    ...(roleFilter() !== 'all' && { role: roleFilter() as UserResponseDto['role'] }),
    ...(statusFilter() !== 'all' && {
      employmentStatus: statusFilter() as UserResponseDto['employmentStatus']
    }),
    ...(departmentFilter() !== 'all' && { departmentId: departmentFilter() })
  };

  // withAsyncData абортит предыдущий запуск при смене параметров — пауза даёт дебаунс ввода
  await wrap(sleep(250));

  const response = await wrap(getApiUsers({ query }));

  return response.data;
}, 'users.list').extend(withAsyncData());

export const usersStats = computed(async () => {
  const countQuery = { page: 1, limit: 1 };

  const [total, active, invited] = await wrap(
    Promise.all([
      getApiUsers({ query: countQuery }),
      getApiUsers({ query: { ...countQuery, employmentStatus: 'active' } }),
      getApiUsers({ query: { ...countQuery, employmentStatus: 'invited' } })
    ])
  );

  return {
    total: total.data.meta.totalItems,
    active: active.data.meta.totalItems,
    invited: invited.data.meta.totalItems,
    inactive: total.data.meta.totalItems - active.data.meta.totalItems - invited.data.meta.totalItems
  };
}, 'users.stats').extend(withAsyncData());

const refreshUsers = () => {
  usersList.retry();
  usersStats.retry();
};

// ── Справочники для селектов ──────────────────────────────────────────────

export const departments = computed(async () => {
  const response = await wrap(getApiOrgDepartments({ query: { limit: 100 } }));

  return response.data.items;
}, 'users.departments').extend(withAsyncData({ initState: [] }));

export const positions = computed(async () => {
  const response = await wrap(getApiOrgPositions({ query: { limit: 100 } }));

  return response.data.items;
}, 'users.positions').extend(withAsyncData({ initState: [] }));

export const managers = computed(async () => {
  const response = await wrap(getApiUsers({ query: { role: 'manager', limit: 100 } }));

  return response.data.items;
}, 'users.managers').extend(withAsyncData({ initState: [] }));

export const recruiters = computed(async () => {
  const response = await wrap(getApiUsers({ query: { role: 'recruiter', limit: 100 } }));

  return response.data.items;
}, 'users.recruiters').extend(withAsyncData({ initState: [] }));

// ── Создание пользователя ─────────────────────────────────────────────────

export const createModalOpened = reatomBoolean(false, 'users.createModalOpened');

/** Шаг 2 модалки создания: созданный пользователь с одноразовым временным паролем */
export const createdUser = atom<CreateUserResponseDto | undefined>(undefined, 'users.createdUser');

const showApiError = (error: unknown) => {
  const apiError = getApiError(error);

  notifications.show({
    title: getErrorCodeMessage(apiError.code),
    message: apiError.message,
    color: 'red'
  });
};

export const createUserForm = reatomForm(
  {
    firstName: '',
    lastName: '',
    patronymic: '',
    email: '',
    role: 'employee' as UserResponseDto['role'],
    departmentId: '',
    positionId: '',
    managerId: '',
    recruiterId: '',
    startDate: ''
  },
  {
    name: 'users.createForm',
    schema: z.object({
      firstName: z.string().min(1, 'Введите имя'),
      lastName: z.string().min(1, 'Введите фамилию'),
      patronymic: z.string(),
      email: z.email('Введите корпоративный email'),
      role: z.enum(['hr', 'recruiter', 'manager', 'employee']),
      departmentId: z.string(),
      positionId: z.string(),
      managerId: z.string(),
      recruiterId: z.string(),
      startDate: z.string().min(1, 'Укажите дату выхода')
    }),
    onSubmit: async (state) => {
      try {
        const response = await wrap(
          postApiUsers({
            body: {
              firstName: state.firstName,
              lastName: state.lastName,
              email: state.email,
              role: state.role,
              startDate: state.startDate,
              ...(state.patronymic && { patronymic: state.patronymic }),
              ...(state.departmentId && { departmentId: state.departmentId }),
              ...(state.positionId && { positionId: state.positionId }),
              ...(state.managerId && { managerId: state.managerId }),
              ...(state.recruiterId && { recruiterId: state.recruiterId })
            }
          })
        );

        createdUser.set(response.data);
        refreshUsers();
      } catch (error) {
        showApiError(error);
      }
    }
  }
);

export const openCreateModal = action(() => {
  createUserForm.reset();
  createdUser.set(undefined);
  createModalOpened.setTrue();
}, 'users.openCreateModal');

export const closeCreateModal = action(() => {
  createModalOpened.setFalse();
  createdUser.set(undefined);
}, 'users.closeCreateModal');

// ── Редактирование и деактивация ──────────────────────────────────────────

export const editingUser = atom<UserResponseDto | undefined>(undefined, 'users.editingUser');

/** Раскрыт ли confirm-блок «Опасной зоны» в модалке редактирования */
export const confirmDeactivation = reatomBoolean(false, 'users.confirmDeactivation');

export const openEditModal = action((userToEdit: UserResponseDto) => {
  confirmDeactivation.setFalse();
  editingUser.set(userToEdit);
}, 'users.openEditModal');

/** Форма редактирования пересоздаётся под выбранного пользователя (computed-фабрика) */
export const editUserForm = computed(() => {
  const current = editingUser();

  if (!current) return null;

  return reatomForm(
    {
      firstName: current.firstName,
      lastName: current.lastName,
      patronymic: asId(current.patronymic) ?? '',
      email: current.email,
      role: current.role,
      departmentId: asId(current.departmentId) ?? '',
      positionId: asId(current.positionId) ?? '',
      managerId: asId(current.managerId) ?? '',
      recruiterId: asId(current.recruiterId) ?? '',
      startDate: current.startDate.slice(0, 10)
    },
    {
      name: `users.editForm#${current.id}`,
      schema: z.object({
        firstName: z.string().min(1, 'Введите имя'),
        lastName: z.string().min(1, 'Введите фамилию'),
        patronymic: z.string(),
        email: z.email('Введите корпоративный email'),
        role: z.enum(['hr', 'recruiter', 'manager', 'employee']),
        departmentId: z.string(),
        positionId: z.string(),
        managerId: z.string(),
        recruiterId: z.string(),
        startDate: z.string().min(1, 'Укажите дату выхода')
      }),
      onSubmit: async (state) => {
        try {
          await wrap(
            patchApiUserById({
              path: { id: current.id },
              body: {
                firstName: state.firstName,
                lastName: state.lastName,
                patronymic: toNullableDtoValue(state.patronymic),
                email: state.email,
                role: state.role,
                departmentId: toNullableDtoValue(state.departmentId),
                positionId: toNullableDtoValue(state.positionId),
                managerId: toNullableDtoValue(state.managerId),
                recruiterId: toNullableDtoValue(state.recruiterId),
                startDate: state.startDate
              }
            })
          );

          editingUser.set(undefined);
          refreshUsers();
          notifications.show({ message: 'Изменения сохранены', color: 'green' });
        } catch (error) {
          showApiError(error);
        }
      }
    }
  );
}, 'users.editUserForm');

export const deactivateUser = action(async (userToDeactivate: UserResponseDto) => {
  try {
    await wrap(patchApiUserByIdDeactivate({ path: { id: userToDeactivate.id } }));

    editingUser.set(undefined);
    refreshUsers();
    notifications.show({
      message: `Аккаунт ${fullName(userToDeactivate)} деактивирован`,
      color: 'gray'
    });
  } catch (error) {
    showApiError(error);
  }
}, 'users.deactivateUser').extend(withAsync());
