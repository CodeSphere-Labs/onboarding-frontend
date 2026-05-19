import { Badge } from '@mantine/core';

export type UserRole = 'employee' | 'hr' | 'manager' | 'recruiter';

const ROLE_BADGE = {
  hr: {
    color: 'grape',
    label: 'HR'
  },
  recruiter: {
    color: 'cyan',
    label: 'Рекрутер'
  },
  manager: {
    color: 'indigo',
    label: 'Менеджер'
  },
  employee: {
    color: 'green',
    label: 'Сотрудник'
  },
  undefined: {
    color: 'gray',
    label: 'Не указано'
  }
} satisfies Record<UserRole & undefined, { color: string; label: string }>;

interface Props {
  role?: UserRole;
}

export const UserRoleBadge = ({ role }: Props) => {
  const badge = ROLE_BADGE[role ?? 'undefined'];

  return (
    <Badge color={badge.color} size='sm'>
      {badge.label}
    </Badge>
  );
};
