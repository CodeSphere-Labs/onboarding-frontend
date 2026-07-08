import type { WelcomePackResourceResponseDto } from '@api';
import type { RequestConfig, RequestOptions } from '@siberiacancode/fetches';

import {
  getApiWelcomePackEmployeeByEmployeeId,
  getApiWelcomePackTemplates,
  postApiWelcomePackAssignments
} from '@api';
import { notifications } from '@mantine/notifications';
import { abortVar, action, atom, computed, withAsync, withAsyncData, wrap } from '@reatom/core';

import { user } from '@/app/user.model';
import { getApiError, getErrorCodeMessage } from '@/shared/api/errorCodes';

import { planEmployeeId } from '../Plan/model';

export const asText = (value: unknown) => (typeof value === 'string' ? value : undefined);

const showApiError = (error: unknown) => {
  const apiError = getApiError(error);

  notifications.show({
    title: getErrorCodeMessage(apiError.code),
    message: apiError.message,
    color: 'red'
  });
};

/** null — пакет сотруднику ещё не назначен (бэкенд отвечает 404) */
export const welcomePack = computed(async () => {
  const employeeId = planEmployeeId();

  if (!employeeId) return null;

  // ожидаемый 404 «пакета нет»: без явного onResponseFailure библиотека fetches
  // оставляет висящий unhandled reject (см. bootstrapAuthConfig в main.tsx);
  // apicraft типизирует config уже, чем читает рантайм — расширяем пересечением
  const config: Partial<RequestConfig> & RequestOptions = {
    signal: abortVar.require().signal,
    onResponseFailure: (error) => {
      throw error;
    }
  };

  try {
    const response = await wrap(
      getApiWelcomePackEmployeeByEmployeeId({ path: { employeeId }, config })
    );

    return response.data.pack;
  } catch (error) {
    if (getApiError(error).code === 'welcome_pack_not_found') {
      return null;
    }

    throw error;
  }
}, 'welcomePack.data').extend(withAsyncData());

export const resourcesByType = computed(() => {
  const groups = new Map<
    WelcomePackResourceResponseDto['resourceType'],
    WelcomePackResourceResponseDto[]
  >();

  for (const resource of welcomePack.data()?.resources ?? []) {
    const group = groups.get(resource.resourceType) ?? [];

    group.push(resource);
    groups.set(resource.resourceType, group);
  }

  for (const group of groups.values()) {
    group.sort((left, right) => left.sortOrder - right.sortOrder);
  }

  return groups;
}, 'welcomePack.resourcesByType');

// ── Назначение пакета (HR) ────────────────────────────────────────────────

export const packTemplates = computed(async () => {
  if (user()?.role !== 'hr') return [];

  const response = await wrap(getApiWelcomePackTemplates({ query: { limit: 100 } }));

  return response.data.items;
}, 'welcomePack.templates').extend(withAsyncData({ initState: [] }));

export const selectedTemplateId = atom<string | undefined>(
  undefined,
  'welcomePack.selectedTemplateId'
);

export const assignWelcomePack = action(async () => {
  const employeeId = planEmployeeId();
  const templateId = selectedTemplateId();

  if (!employeeId || !templateId) {
    notifications.show({ message: 'Выберите шаблон welcome-пакета', color: 'red' });

    return;
  }

  try {
    await wrap(postApiWelcomePackAssignments({ body: { employeeId, templateId } }));

    welcomePack.retry();
    selectedTemplateId.set(undefined);
    notifications.show({ message: 'Welcome-пакет назначен', color: 'green' });
  } catch (error) {
    showApiError(error);
  }
}, 'welcomePack.assign').extend(withAsync());
