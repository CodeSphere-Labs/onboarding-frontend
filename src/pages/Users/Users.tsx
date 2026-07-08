import type { UserResponseDto } from '@api';

import {
  Avatar,
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Table,
  Text,
  TextInput
} from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconCaretUpDown,
  IconKey,
  IconPencil,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconUserPlus,
  IconUsers
} from '@tabler/icons-react';

import { user } from '@/app/user.model';
import { UserRoleBadge } from '@/shared/components';

import type { UserRoleFilter, UsersSortBy, UserStatusFilter } from './model';

import { CreateUserModal } from './components/CreateUserModal/CreateUserModal';
import { EditUserModal } from './components/EditUserModal/EditUserModal';
import { ResetPasswordModal } from './components/ResetPasswordModal/ResetPasswordModal';
import {
  asId,
  departmentFilter,
  departments,
  fullName,
  openCreateModal,
  openEditModal,
  openResetPasswordModal,
  page,
  positions,
  roleFilter,
  searchQuery,
  sortBy,
  sortOrder,
  statusFilter,
  toggleSort,
  usersList,
  usersStats
} from './model';

import classes from './users.module.css';

const STATUS_META: Record<UserResponseDto['employmentStatus'], { color: string; label: string }> = {
  active: { color: 'green', label: 'Активен' },
  invited: { color: 'blue', label: 'Приглашён' },
  inactive: { color: 'gray', label: 'Деактивирован' }
};

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'Все роли' },
  { value: 'hr', label: 'HR' },
  { value: 'recruiter', label: 'Рекрутер' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'employee', label: 'Сотрудник' }
];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активен' },
  { value: 'invited', label: 'Приглашён' },
  { value: 'inactive', label: 'Деактивирован' }
];

const SortableTh = reatomComponent(
  ({ label, sortKey }: { label: string; sortKey: UsersSortBy }) => {
    const isSorted = sortBy() === sortKey;
    const SortIcon = !isSorted
      ? IconCaretUpDown
      : sortOrder() === 'asc'
        ? IconSortAscending
        : IconSortDescending;

    return (
      <Table.Th className={classes.sortableTh} onClick={() => toggleSort(sortKey)}>
        <span className={classes.sortableThLabel}>
          {label}
          <SortIcon opacity={isSorted ? 1 : 0.4} size={14} />
        </span>
      </Table.Th>
    );
  },
  'SortableTh'
);

export const Users = reatomComponent(() => {
  const list = usersList.data();
  const stats = usersStats.data();

  const departmentNames = new Map(departments.data().map((item) => [item.id, item.name]));
  const positionNames = new Map(positions.data().map((item) => [item.id, item.name]));

  const statCards = [
    { label: 'Всего пользователей', value: stats?.total },
    { label: 'Активных аккаунтов', value: stats?.active, color: 'var(--mantine-color-green-6)' },
    { label: 'Приглашены', value: stats?.invited, color: 'var(--mantine-color-blue-6)' },
    { label: 'Деактивированы', value: stats?.inactive, color: 'var(--mantine-color-dimmed)' }
  ];

  return (
    <>
      <Group justify='flex-end' mb='md'>
        <Button leftSection={<IconUserPlus size={16} />} onClick={() => openCreateModal()}>
          Создать пользователя
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} mb='md'>
        {statCards.map((card) => (
          <Paper withBorder key={card.label} p='md' radius='md'>
            <Text fw={700} fz={24} lh={1} style={{ color: card.color }}>
              {card.value ?? '—'}
            </Text>
            <Text c='dimmed' fz='xs' mt={4}>
              {card.label}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Group gap='xs' mb='md' wrap='wrap'>
        <TextInput
          className={classes.search}
          leftSection={<IconSearch size={16} />}
          placeholder='Поиск по имени или email…'
          value={searchQuery()}
          onChange={(event) => {
            searchQuery.set(event.currentTarget.value);
            page.set(1);
          }}
        />
        <Select
          data={ROLE_FILTER_OPTIONS}
          value={roleFilter()}
          w={150}
          onChange={(value) => {
            roleFilter.set((value ?? 'all') as UserRoleFilter);
            page.set(1);
          }}
        />
        <Select
          data={[
            { value: 'all', label: 'Все отделы' },
            ...departments.data().map((item) => ({ value: item.id, label: item.name }))
          ]}
          value={departmentFilter()}
          w={160}
          onChange={(value) => {
            departmentFilter.set(value ?? 'all');
            page.set(1);
          }}
        />
        <Select
          data={STATUS_FILTER_OPTIONS}
          value={statusFilter()}
          w={160}
          onChange={(value) => {
            statusFilter.set((value ?? 'all') as UserStatusFilter);
            page.set(1);
          }}
        />
        <Text c='dimmed' fz='xs' ml='auto'>
          {list ? `${list.items.length} из ${list.meta.totalItems}` : ''}
        </Text>
      </Group>

      <Paper withBorder pos='relative' radius='md'>
        <LoadingOverlay visible={!usersList.ready()} zIndex={10} />

        <Table.ScrollContainer minWidth={720}>
          <Table highlightOnHover verticalSpacing='sm'>
            <Table.Thead>
              <Table.Tr>
                <SortableTh label='Пользователь' sortKey='lastName' />
                <Table.Th>Роль</Table.Th>
                <Table.Th>Отдел</Table.Th>
                <Table.Th>Должность</Table.Th>
                <SortableTh label='Дата выхода' sortKey='startDate' />
                <Table.Th>Статус</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list?.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <div className={classes.empty}>
                      <IconUsers opacity={0.4} size={28} />
                      <Text c='dimmed' fz='sm'>
                        Пользователи не найдены
                      </Text>
                    </div>
                  </Table.Td>
                </Table.Tr>
              )}
              {list?.items.map((item) => {
                const status = STATUS_META[item.employmentStatus];
                const departmentId = asId(item.departmentId);
                const positionId = asId(item.positionId);

                return (
                  <Table.Tr
                    key={item.id}
                    className={classes.row}
                    opacity={item.employmentStatus === 'inactive' ? 0.5 : 1}
                  >
                    <Table.Td>
                      <Group gap='xs' wrap='nowrap'>
                        <Avatar color='initials' name={fullName(item)} size={30} />
                        <div>
                          <Text fw={600} fz='sm'>
                            {fullName(item)}
                          </Text>
                          <Text c='dimmed' fz='xs'>
                            {item.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <UserRoleBadge role={item.role} />
                    </Table.Td>
                    <Table.Td>
                      <Text c='dimmed' fz='sm'>
                        {(departmentId && departmentNames.get(departmentId)) || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz='sm'>{(positionId && positionNames.get(positionId)) || '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c='dimmed' fz='sm'>
                        {new Date(item.startDate).toLocaleDateString('ru-RU')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={status.color} size='sm' variant='light'>
                        {status.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify='flex-end' wrap='nowrap'>
                        {item.employmentStatus !== 'inactive' && item.id !== user()?.id && (
                          <Button
                            className={classes.rowAction}
                            color='gray'
                            leftSection={<IconKey size={14} />}
                            size='compact-xs'
                            variant='subtle'
                            onClick={() => openResetPasswordModal(item)}
                          >
                            Сброс пароля
                          </Button>
                        )}
                        <Button
                          className={classes.rowAction}
                          color='gray'
                          leftSection={<IconPencil size={14} />}
                          size='compact-xs'
                          variant='subtle'
                          onClick={() => openEditModal(item)}
                        >
                          Изменить
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {list && list.meta.totalPages > 1 && (
        <Group justify='center' mt='md'>
          <Pagination
            total={list.meta.totalPages}
            value={page()}
            onChange={(nextPage) => page.set(nextPage)}
          />
        </Group>
      )}

      <CreateUserModal />
      <EditUserModal />
      <ResetPasswordModal />
    </>
  );
}, 'Users');
