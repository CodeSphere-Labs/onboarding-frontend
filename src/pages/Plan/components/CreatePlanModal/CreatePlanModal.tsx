import type { SubmitEventHandler } from 'react';

import { Alert, Button, Group, Modal, Select, TextInput } from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconInfoCircle, IconRocket } from '@tabler/icons-react';

import { user } from '@/app/user.model';

import {
  createPlanForm,
  createPlanModalOpened,
  hrManagers,
  templatesForPlan
} from '../../model';

const handleSubmit: SubmitEventHandler = (event) => {
  event.preventDefault();
  createPlanForm.submit();
};

export const CreatePlanModal = reatomComponent(() => {
  const role = user()?.role;
  const templateField = bindField(createPlanForm.fields.templateId);
  const managerField = bindField(createPlanForm.fields.managerId);
  const templateSelected = !!createPlanForm.fields.templateId.value();

  return (
    <Modal
      centered
      opened={createPlanModalOpened()}
      title='Создать онбординг-план'
      onClose={() => createPlanModalOpened.setFalse()}
    >
      <form onSubmit={handleSubmit}>
        {role === 'hr' && (
          <>
            <Select
              clearable
              searchable
              data={templatesForPlan
                .data()
                .map((template) => ({ value: template.id, label: template.name }))}
              label='Шаблон'
              placeholder='Из шаблона (рекомендуется)'
              {...templateField}
              onChange={(value) => templateField.onChange(value ?? '')}
            />
            <Select
              searchable
              withAsterisk
              data={hrManagers
                .data()
                .map((manager) => ({
                  value: manager.id,
                  label: `${manager.lastName} ${manager.firstName}`.trim()
                }))}
              label='Менеджер плана'
              mt='sm'
              placeholder='Выберите менеджера'
              {...managerField}
              onChange={(value) => managerField.onChange(value ?? '')}
            />
          </>
        )}

        {role === 'manager' && (
          <Alert color='gray' icon={<IconInfoCircle size={16} />} radius='md' variant='light'>
            Менеджером плана будете назначены вы. Библиотека шаблонов доступна HR — план
            создаётся с первой задачи, остальные добавите на странице плана.
          </Alert>
        )}

        <TextInput
          withAsterisk
          label='Дата старта'
          mt='sm'
          type='date'
          {...bindField(createPlanForm.fields.startsAt)}
        />

        {!templateSelected && (
          <TextInput
            withAsterisk
            label='Первая задача'
            mt='sm'
            placeholder='Например: Знакомство с командой'
            {...bindField(createPlanForm.fields.firstTaskTitle)}
          />
        )}

        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={() => createPlanModalOpened.setFalse()}>
            Отмена
          </Button>
          <Button
            leftSection={<IconRocket size={16} />}
            loading={!!createPlanForm.submit.pending()}
            type='submit'
          >
            Создать план
          </Button>
        </Group>
      </form>
    </Modal>
  );
}, 'CreatePlanModal');
