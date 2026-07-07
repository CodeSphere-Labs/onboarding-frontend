import type { UserResponseDto } from '@api';
import type { SubmitEventHandler } from 'react';

import {
  Alert,
  Button,
  CopyButton,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Text,
  TextInput
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconCheck, IconCopy, IconInfoCircle, IconUserPlus } from '@tabler/icons-react';

import {
  closeCreateModal,
  createdUser,
  createModalOpened,
  createUserForm,
  departments,
  fullName,
  managers,
  positions,
  recruiters
} from '../../model';

import classes from './createUserModal.module.css';

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'recruiter', label: 'Рекрутер' },
  { value: 'hr', label: 'HR' }
];

const handleSubmit: SubmitEventHandler = (event) => {
  event.preventDefault();
  createUserForm.submit();
};

const CreatedUserStep = reatomComponent(() => {
  const created = createdUser();

  if (!created) return null;

  return (
    <>
      <Alert color='green' icon={<IconCheck size={16} />} radius='md' title='Аккаунт создан'>
        {fullName(created.user)} · {created.user.email}
      </Alert>

      <Text fw={600} fz='sm' mt='lg'>
        Временный пароль
      </Text>
      <Text c='dimmed' fz='xs' mb='sm'>
        Передайте этот пароль сотруднику лично при выходе на работу. После первого входа он сможет
        его изменить.
      </Text>

      <div className={classes.passwordBox}>
        <div>
          <Text c='dimmed' fz='xs'>
            Пароль для первого входа
          </Text>
          <div className={classes.passwordCode}>{created.temporaryPassword}</div>
        </div>
        <CopyButton value={created.temporaryPassword}>
          {({ copied, copy }) => (
            <Button
              leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              size='xs'
              variant='outline'
              onClick={copy}
            >
              {copied ? 'Скопировано' : 'Копировать'}
            </Button>
          )}
        </CopyButton>
      </div>

      <Alert color='orange' mt='md' radius='md' variant='light'>
        Сохраните пароль — он показывается только один раз.
      </Alert>

      <Group justify='flex-end' mt='lg'>
        <Button onClick={() => closeCreateModal()}>Готово</Button>
      </Group>
    </>
  );
}, 'CreatedUserStep');

const CreateUserFormStep = reatomComponent(() => {
  const lastNameField = bindField(createUserForm.fields.lastName);
  const firstNameField = bindField(createUserForm.fields.firstName);
  const patronymicField = bindField(createUserForm.fields.patronymic);
  const emailField = bindField(createUserForm.fields.email);
  const roleField = bindField(createUserForm.fields.role);
  const departmentField = bindField(createUserForm.fields.departmentId);
  const positionField = bindField(createUserForm.fields.positionId);
  const managerField = bindField(createUserForm.fields.managerId);
  const recruiterField = bindField(createUserForm.fields.recruiterId);
  const startDateField = bindField(createUserForm.fields.startDate);

  return (
    <form onSubmit={handleSubmit}>
      <SimpleGrid cols={2} spacing='sm'>
        <TextInput required label='Фамилия' placeholder='Ковалёва' {...lastNameField} />
        <TextInput required label='Имя' placeholder='Алина' {...firstNameField} />
        <TextInput label='Отчество' placeholder='Сергеевна' {...patronymicField} />
        <TextInput
          required
          label='Корп. email'
          placeholder='a.kovaleva@company.ru'
          type='email'
          {...emailField}
        />
        <Select
          required
          data={ROLE_OPTIONS}
          label='Роль'
          {...roleField}
          onChange={(value) => roleField.onChange((value ?? 'employee') as UserResponseDto['role'])}
        />
        <Select
          clearable
          data={departments.data().map((item) => ({ value: item.id, label: item.name }))}
          label='Отдел'
          placeholder='Выберите отдел'
          {...departmentField}
          onChange={(value) => departmentField.onChange(value ?? '')}
        />
        <Select
          clearable
          data={positions.data().map((item) => ({ value: item.id, label: item.name }))}
          label='Должность'
          placeholder='Выберите должность'
          {...positionField}
          onChange={(value) => positionField.onChange(value ?? '')}
        />
        <TextInput required label='Дата выхода' type='date' {...startDateField} />
        <Select
          clearable
          searchable
          data={managers.data().map((item) => ({ value: item.id, label: fullName(item) }))}
          label='Менеджер'
          placeholder='Выберите менеджера'
          {...managerField}
          onChange={(value) => managerField.onChange(value ?? '')}
        />
        <Select
          clearable
          searchable
          data={recruiters.data().map((item) => ({ value: item.id, label: fullName(item) }))}
          label='Рекрутер'
          placeholder='Выберите рекрутера'
          {...recruiterField}
          onChange={(value) => recruiterField.onChange(value ?? '')}
        />
      </SimpleGrid>

      <Alert color='gray' icon={<IconInfoCircle size={16} />} mt='md' radius='md' variant='light'>
        Приглашений по email нет. Временный пароль будет сгенерирован системой и передаётся
        сотруднику лично в первый день.
      </Alert>

      <Group justify='flex-end' mt='lg'>
        <Button variant='default' onClick={() => closeCreateModal()}>
          Отмена
        </Button>
        <Button
          leftSection={<IconUserPlus size={16} />}
          loading={!!createUserForm.submit.pending()}
          type='submit'
        >
          Создать пользователя
        </Button>
      </Group>
    </form>
  );
}, 'CreateUserFormStep');

export const CreateUserModal = reatomComponent(
  () => (
    <Modal
      centered
      opened={createModalOpened()}
      size='lg'
      title={createdUser() ? 'Пользователь создан' : 'Создать пользователя'}
      onClose={() => closeCreateModal()}
    >
      {createdUser() ? <CreatedUserStep /> : <CreateUserFormStep />}
    </Modal>
  ),
  'CreateUserModal'
);
