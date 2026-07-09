import { Select, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconUserSearch } from '@tabler/icons-react';

import { router } from '@/app/router';
import { user } from '@/app/user.model';

import { employeeOptions, openEmployeePlan, planEmployeeId, viewedEmployeeId } from '../../model';

/** Селектор сотрудника для менеджера/HR; сотрудник всегда смотрит свои данные */
export const EmployeePicker = reatomComponent(() => {
  const role = user()?.role;

  if (role === 'employee') return null;

  return (
    <Select
      searchable
      data={employeeOptions.data().map((option) => ({ value: option.id, label: option.name }))}
      placeholder='Выберите сотрудника'
      value={planEmployeeId() ?? null}
      w={260}
      onChange={(value) => {
        // на странице плана выбор попадает в URL (/plan/:employeeId) — ссылку можно шэрить
        if (router.plan.match()) {
          openEmployeePlan(value ?? undefined);
        } else {
          viewedEmployeeId.set(value ?? undefined);
        }
      }}
    />
  );
}, 'EmployeePicker');

/** Заглушка «выберите сотрудника» для страниц, зависящих от выбора */
export const EmployeeNotSelected = reatomComponent(() => {
  const role = user()?.role;

  if (role === 'employee' || planEmployeeId()) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '64px 24px',
        textAlign: 'center'
      }}
    >
      <IconUserSearch opacity={0.3} size={48} />
      <Text fw={600} fz='sm'>
        Выберите сотрудника
      </Text>
      <Text c='dimmed' fz='sm'>
        Данные показываются для выбранного сотрудника
      </Text>
    </div>
  );
}, 'EmployeeNotSelected');
