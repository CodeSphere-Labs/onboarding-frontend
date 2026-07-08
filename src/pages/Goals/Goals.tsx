import { Group } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import {
  EmployeeNotSelected,
  EmployeePicker
} from '../Plan/components/EmployeePicker/EmployeePicker';
import { GoalsTab } from '../Plan/components/GoalsTab/GoalsTab';
import { planEmployeeId } from '../Plan/model';

/**
 * Отдельная страница целей (пункт «Цели» / «Мои цели»). Данные и права —
 * общая модель с планом (PRD §3.3): выбранный сотрудник переживает переходы
 * между «План» и «Цели».
 */
export const Goals = reatomComponent(
  () => (
    <>
      <Group justify='space-between' mb='md'>
        <EmployeePicker />
      </Group>

      <EmployeeNotSelected />

      {planEmployeeId() && <GoalsTab />}
    </>
  ),
  'Goals'
);
