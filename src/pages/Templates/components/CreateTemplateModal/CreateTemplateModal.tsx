import type { SubmitEventHandler } from 'react';

import { Button, Group, Modal, Select, Textarea, TextInput } from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconFiles } from '@tabler/icons-react';

import { createModalOpened, createTemplateForm, departments } from '../../model';

const handleSubmit: SubmitEventHandler = (event) => {
  event.preventDefault();
  createTemplateForm.submit();
};

export const CreateTemplateModal = reatomComponent(() => {
  const nameField = bindField(createTemplateForm.fields.name);
  const departmentField = bindField(createTemplateForm.fields.departmentId);
  const descriptionField = bindField(createTemplateForm.fields.description);

  return (
    <Modal
      centered
      opened={createModalOpened()}
      title='Новый шаблон'
      onClose={() => createModalOpened.setFalse()}
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          data-autofocus
          required
          label='Название роли'
          placeholder='Frontend Developer'
          {...nameField}
        />
        <Select
          clearable
          data={departments.data().map((item) => ({ value: item.id, label: item.name }))}
          label='Отдел'
          mt='sm'
          placeholder='Выберите отдел'
          {...departmentField}
          onChange={(value) => departmentField.onChange(value ?? '')}
        />
        <Textarea
          label='Описание'
          mt='sm'
          placeholder='Краткое описание шаблона…'
          rows={2}
          {...descriptionField}
        />

        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={() => createModalOpened.setFalse()}>
            Отмена
          </Button>
          <Button
            leftSection={<IconFiles size={16} />}
            loading={!!createTemplateForm.submit.pending()}
            type='submit'
          >
            Создать шаблон
          </Button>
        </Group>
      </form>
    </Modal>
  );
}, 'CreateTemplateModal');
