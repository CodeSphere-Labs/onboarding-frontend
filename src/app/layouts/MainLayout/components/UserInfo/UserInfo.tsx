import { Avatar, Title } from '@mantine/core';
import { reatomComponent } from '@reatom/react';

import { user } from '@/app/user.model';
import { UserRoleBadge } from '@/shared/components';

import classes from './userInfo.module.css';

export const UserInfo = reatomComponent(() => (
  <div className={classes.card}>
    <Avatar color='initials' name={`${user()?.firstName} ${user()?.lastName}`} />
    <div className={classes.userInfo}>
      <Title className={classes.userName} order={6}>
        {`${user()?.firstName} ${user()?.lastName}`}
      </Title>
      <UserRoleBadge role={user()?.role} />
    </div>
  </div>
));
