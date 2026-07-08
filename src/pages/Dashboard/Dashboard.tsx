import { LoadingOverlay } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { user } from '@/app/user.model';

import { EmployeeView } from './components/EmployeeView/EmployeeView';
import { HrView } from './components/HrView/HrView';
import { ManagerView } from './components/ManagerView/ManagerView';
import { RecruiterView } from './components/RecruiterView/RecruiterView';
import { dashboard } from './model';

const VIEW_BY_ROLE = {
  hr: HrView,
  manager: ManagerView,
  recruiter: RecruiterView,
  employee: EmployeeView
} as const;

export const Dashboard = reatomComponent(() => {
  const role = user()?.role;
  const View = role ? VIEW_BY_ROLE[role] : undefined;

  return (
    <div style={{ position: 'relative', minHeight: 160 }}>
      <LoadingOverlay visible={!dashboard.ready()} zIndex={10} />
      {dashboard.ready() && View && <View />}
    </div>
  );
}, 'Dashboard');
