import type {
  EmployeeDashboardResponseDto,
  HrDashboardResponseDto,
  ManagerDashboardResponseDto,
  RecruiterDashboardResponseDto
} from '@api';

import { getApiDashboard } from '@api';
import { abortVar, computed, withAsyncData, wrap } from '@reatom/core';

import { user } from '@/app/user.model';

export type AnyDashboard =
  | EmployeeDashboardResponseDto
  | HrDashboardResponseDto
  | ManagerDashboardResponseDto
  | RecruiterDashboardResponseDto;

/** Бэкенд отдаёт вид по роли текущего пользователя — тип уточняется по user().role */
export const dashboard = computed(async () => {
  const response = await wrap(
    getApiDashboard({ config: { signal: abortVar.require().signal } })
  );

  return response.data.dashboard as AnyDashboard;
}, 'dashboard.data').extend(withAsyncData());

export const hrDashboard = computed(
  () => (user()?.role === 'hr' ? (dashboard.data() as HrDashboardResponseDto) : undefined),
  'dashboard.hr'
);

export const managerDashboard = computed(
  () =>
    user()?.role === 'manager' ? (dashboard.data() as ManagerDashboardResponseDto) : undefined,
  'dashboard.manager'
);

export const recruiterDashboard = computed(
  () =>
    user()?.role === 'recruiter'
      ? (dashboard.data() as RecruiterDashboardResponseDto)
      : undefined,
  'dashboard.recruiter'
);

export const employeeDashboard = computed(
  () =>
    user()?.role === 'employee'
      ? (dashboard.data() as EmployeeDashboardResponseDto)
      : undefined,
  'dashboard.employee'
);
