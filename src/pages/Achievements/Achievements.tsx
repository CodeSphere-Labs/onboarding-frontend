import { Group } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { AchievementsTab } from '../Plan/components/AchievementsTab/AchievementsTab';
import {
  EmployeeNotSelected,
  EmployeePicker
} from '../Plan/components/EmployeePicker/EmployeePicker';
import { planEmployeeId } from '../Plan/model';

/**
 * Отдельная страница достижений (PRD §3.4): архив по месяцам, добавляют
 * сотрудник и менеджер, подтверждает менеджер. Данные — общая модель с планом.
 */
export const Achievements = reatomComponent(() => (
  <>
    <Group justify='space-between' mb='md'>
      <EmployeePicker />
    </Group>

    <EmployeeNotSelected />

    {planEmployeeId() && <AchievementsTab />}
  </>
), 'Achievements');
