import type { SubmitEventHandler } from 'react';

import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';

import { editingTask, taskForm } from '../../model';

const TaskFormFields = reatomComponent(() => {
  const form = taskForm();

  if (!form) return null;

  const titleField = bindField(form.fields.title);
  const descriptionField = bindField(form.fields.description);

  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault();
    form.submit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        data-autofocus
        required
        label='Название'
        placeholder='Что нужно сделать'
        {...titleField}
      />
      <Textarea
        label='Описание'
        mt='sm'
        placeholder='Дополнительные детали или инструкции…'
        rows={3}
        {...descriptionField}
      />

      <Group justify='flex-end' mt='lg'>
        <Button variant='default' onClick={() => editingTask.set(undefined)}>
          Отмена
        </Button>
        <Button loading={!!form.submit.pending()} type='submit'>
          Сохранить
        </Button>
      </Group>
    </form>
  );
}, 'TaskFormFields');

export const TaskModal = reatomComponent(
  () => (
    <Modal
      centered
      opened={!!editingTask()}
      title='Редактировать задачу'
      onClose={() => editingTask.set(undefined)}
    >
      <TaskFormFields />
    </Modal>
  ),
  'TaskModal'
);
