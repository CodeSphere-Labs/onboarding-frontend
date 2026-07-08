import type { OnboardingPlanResponseDto, UserResponseDto } from '@api';

import { getApiOnboardingPlans, getApiOrgDepartments, getApiUsers } from '@api';
import { abortVar, atom, computed, withAsyncData, wrap } from '@reatom/core';

// TODO(рефакторинг): summarizeTasks и статусные меты просятся в shared при следующем заходе
import { summarizeTasks } from '../Plan/model';

export type PlanStatusFilter = 'all' | OnboardingPlanResponseDto['status'];

const PAGE_LIMIT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

export const statusFilter = atom<PlanStatusFilter>('all', 'onboardings.statusFilter');
export const page = atom(1, 'onboardings.page');

export const plansList = computed(async () => {
  const status = statusFilter();
  const response = await wrap(
    getApiOnboardingPlans({
      query: {
        page: page(),
        limit: PAGE_LIMIT,
        ...(status !== 'all' && { status })
      },
      config: { signal: abortVar.require().signal }
    })
  );

  return response.data;
}, 'onboardings.list').extend(withAsyncData());

export const employees = computed(async () => {
  const response = await wrap(getApiUsers({ query: { role: 'employee', limit: 100 } }));

  return response.data.items;
}, 'onboardings.employees').extend(withAsyncData({ initState: [] }));

export const managers = computed(async () => {
  const response = await wrap(getApiUsers({ query: { role: 'manager', limit: 100 } }));

  return response.data.items;
}, 'onboardings.managers').extend(withAsyncData({ initState: [] }));

export const departments = computed(async () => {
  const response = await wrap(getApiOrgDepartments({ query: { limit: 100 } }));

  return response.data.items;
}, 'onboardings.departments').extend(withAsyncData({ initState: [] }));

export const userById = computed(() => {
  const map = new Map<string, UserResponseDto>();

  for (const item of [...employees.data(), ...managers.data()]) {
    map.set(item.id, item);
  }

  return map;
}, 'onboardings.userById');

export const departmentNameById = computed(
  () => new Map(departments.data().map((item) => [item.id, item.name])),
  'onboardings.departmentNameById'
);

export const fullName = (user: Pick<UserResponseDto, 'firstName' | 'lastName'> | undefined) =>
  user ? `${user.lastName} ${user.firstName}`.trim() : '—';

export const planDayNumber = (plan: OnboardingPlanResponseDto) =>
  Math.max(1, Math.floor((Date.now() - new Date(plan.startsAt).getTime()) / DAY_MS) + 1);

export { summarizeTasks };
