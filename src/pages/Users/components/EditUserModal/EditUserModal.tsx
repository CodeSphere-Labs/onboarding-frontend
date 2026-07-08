import type { UserResponseDto } from '@api';

import {
  Alert,
  Avatar,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Text,
  TextInput
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconDeviceFloppy, IconUserMinus } from '@tabler/icons-react';

import {
  confirmDeactivation,
  deactivateUser,
  departments,
  editingUser,
  editUserForm,
  fullName,
  managers,
  positions,
  recruiters
} from '../../model';

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'recruiter', label: 'Рекрутер' },
  { value: 'hr', label: 'HR' }
];

type EditForm = NonNullable<ReturnType<typeof editUserForm>>;

const EditUserFormFields = reatomComponent(
  ({ current, form }: { current: UserResponseDto; form: EditForm }) => {
    const lastNameField = bindField(form.fields.lastName);
    const firstNameField = bindField(form.fields.firstName);
    const patronymicField = bindField(form.fields.patronymic);
    const emailField = bindField(form.fields.email);
    const roleField = bindField(form.fields.role);
    const departmentField = bindField(form.fields.departmentId);
    const positionField = bindField(form.fields.positionId);
    const managerField = bindField(form.fields.managerId);
    const recruiterField = bindField(form.fields.recruiterId);
    const startDateField = bindField(form.fields.startDate);

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.submit();
        }}
      >
        <SimpleGrid cols={2} spacing='sm'>
          <TextInput required label='Фамилия' {...lastNameField} />
          <TextInput required label='Имя' {...firstNameField} />
          <TextInput label='Отчество' {...patronymicField} />
          <TextInput required label='Корп. email' type='email' {...emailField} />
          <Select
            required
            data={ROLE_OPTIONS}
            label='Роль'
            {...roleField}
            onChange={(value) =>
              roleField.onChange((value ?? 'employee') as UserResponseDto['role'])
            }
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

        {current.employmentStatus !== 'inactive' && (
          <>
            <Divider my='md' />
            <Text c='red' fw={700} fz='sm' mb='xs'>
              Опасная зона
            </Text>

            {confirmDeactivation() ? (
              <>
                <Alert color='red' radius='md' variant='light'>
                  Аккаунт <b>{fullName(current)}</b> будет деактивирован. Пользователь потеряет
                  доступ к системе. Данные сохранятся.
                </Alert>
                <Group gap='xs' mt='xs'>
                  <Button
                    color='red'
                    loading={!!deactivateUser.pending()}
                    size='xs'
                    variant='outline'
                    onClick={() => deactivateUser(current)}
                  >
                    Деактивировать
                  </Button>
                  <Button
                    color='gray'
                    size='xs'
                    variant='subtle'
                    onClick={() => confirmDeactivation.setFalse()}
                  >
                    Отмена
                  </Button>
                </Group>
              </>
            ) : (
              <Button
                color='red'
                leftSection={<IconUserMinus size={14} />}
                size='xs'
                variant='outline'
                onClick={() => confirmDeactivation.setTrue()}
              >
                Деактивировать аккаунт
              </Button>
            )}
          </>
        )}

        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={() => editingUser.set(undefined)}>
            Отмена
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            loading={!!form.submit.pending()}
            type='submit'
          >
            Сохранить изменения
          </Button>
        </Group>
      </form>
    );
  },
  'EditUserFormFields'
);

export const EditUserModal = reatomComponent(() => {
  const current = editingUser();
  const form = editUserForm();

  return (
    <Modal
      centered
      title={
        current && (
          <Group gap='xs'>
            <Avatar color='initials' name={fullName(current)} size={28} />
            <div>
              <Text fw={700} fz='sm'>
                {fullName(current)}
              </Text>
              <Text c='dimmed' fz='xs'>
                {current.email}
              </Text>
            </div>
          </Group>
        )
      }
      opened={!!current}
      size='lg'
      onClose={() => editingUser.set(undefined)}
    >
      {current && form && <EditUserFormFields current={current} form={form} />}
    </Modal>
  );
}, 'EditUserModal');
