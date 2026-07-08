import type { FeedbackResponseDto } from '@api';
import type { SubmitEventHandler } from 'react';

import {
  Alert,
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  Select,
  Tabs,
  Text,
  Textarea
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import {
  IconArrowDown,
  IconArrowUp,
  IconInbox,
  IconInfoCircle,
  IconMessagePlus,
  IconSend,
  IconSpy,
  IconUsersGroup
} from '@tabler/icons-react';

import {
  createFeedbackForm,
  createModalOpened,
  feedbackList,
  openCreateModal,
  receivedFeedback,
  recipientFullName,
  recipientNameById,
  recipients,
  sentFeedback,
  teamFeedback,
  teamTabLabel
} from './model';

import classes from './feedback.module.css';

const FeedbackCard = reatomComponent(
  ({ item, showRecipient }: { item: FeedbackResponseDto; showRecipient: boolean }) => (
    <Paper withBorder mb='xs' p='md' radius='md'>
      <Group gap='xs' justify='space-between' mb='sm'>
        <Group gap='xs'>
          <Badge
            color='gray'
            leftSection={<IconSpy size={12} />}
            size='sm'
            variant='light'
          >
            Аноним
          </Badge>
          {showRecipient && (
            <Text fw={600} fz='sm'>
              → {recipientNameById().get(item.recipientId) ?? 'Сотрудник'}
            </Text>
          )}
        </Group>
        <Text c='dimmed' fz='xs'>
          {new Date(item.createdAt).toLocaleDateString('ru-RU')}
        </Text>
      </Group>

      <div className={classes.strengths}>
        <Group gap={6} mb={4}>
          <IconArrowUp size={14} />
          <Text fw={600} fz='xs' tt='uppercase'>
            Что хорошо
          </Text>
        </Group>
        <Text fz='sm'>{item.strengths}</Text>
      </div>

      <div className={classes.improvements}>
        <Group gap={6} mb={4}>
          <IconArrowDown size={14} />
          <Text fw={600} fz='xs' tt='uppercase'>
            Что можно улучшить
          </Text>
        </Group>
        <Text fz='sm'>{item.improvements}</Text>
      </div>
    </Paper>
  ),
  'FeedbackCard'
);

const FeedbackListPanel = reatomComponent(
  ({
    emptyText,
    items,
    showRecipient
  }: {
    emptyText: string;
    items: FeedbackResponseDto[];
    showRecipient: boolean;
  }) => (
    <>
      {items.map((item) => (
        <FeedbackCard key={item.id} item={item} showRecipient={showRecipient} />
      ))}
      {items.length === 0 && (
        <Text c='dimmed' fz='sm' py='xl' ta='center'>
          {emptyText}
        </Text>
      )}
    </>
  ),
  'FeedbackListPanel'
);

const CreateFeedbackModal = reatomComponent(() => {
  const recipientField = bindField(createFeedbackForm.fields.recipientId);

  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault();
    createFeedbackForm.submit();
  };

  return (
    <Modal
      centered
      opened={createModalOpened()}
      title='Оставить фидбек'
      onClose={() => createModalOpened.setFalse()}
    >
      <form onSubmit={handleSubmit}>
        <Alert
          color='gray'
          icon={<IconInfoCircle size={16} />}
          mb='sm'
          radius='md'
          variant='light'
        >
          Фидбек анонимный: получатель и другие читатели не увидят автора.
        </Alert>

        <Select
          searchable
          withAsterisk
          data={recipients.data().map((item) => ({
            value: item.id,
            label: recipientFullName(item)
          }))}
          label='Кому'
          placeholder='Выберите сотрудника'
          {...recipientField}
          onChange={(value) => recipientField.onChange(value ?? '')}
        />
        <Textarea
          data-autofocus
          withAsterisk
          label='Что хорошо'
          mt='sm'
          placeholder='Сильные стороны, что получается…'
          rows={3}
          {...bindField(createFeedbackForm.fields.strengths)}
        />
        <Textarea
          withAsterisk
          label='Что можно улучшить'
          mt='sm'
          placeholder='Зоны роста, пожелания…'
          rows={3}
          {...bindField(createFeedbackForm.fields.improvements)}
        />

        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={() => createModalOpened.setFalse()}>
            Отмена
          </Button>
          <Button
            leftSection={<IconSend size={15} />}
            loading={!!createFeedbackForm.submit.pending()}
            type='submit'
          >
            Отправить анонимно
          </Button>
        </Group>
      </form>
    </Modal>
  );
}, 'CreateFeedbackModal');

export const Feedback = reatomComponent(() => {
  const teamLabel = teamTabLabel();

  return (
    <>
      <Group justify='flex-end' mb='md'>
        <Button leftSection={<IconMessagePlus size={16} />} onClick={() => openCreateModal()}>
          Оставить фидбек
        </Button>
      </Group>

      <div style={{ position: 'relative', minHeight: 120 }}>
        <LoadingOverlay visible={!feedbackList.ready()} zIndex={10} />

        <Tabs defaultValue='received' keepMounted={false}>
          <Tabs.List mb='md'>
            <Tabs.Tab leftSection={<IconInbox size={15} />} value='received'>
              Полученный
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconSend size={15} />} value='sent'>
              Отправленный
            </Tabs.Tab>
            {teamLabel && (
              <Tabs.Tab leftSection={<IconUsersGroup size={15} />} value='team'>
                {teamLabel}
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value='received'>
            <FeedbackListPanel
              emptyText='Вам пока не оставляли фидбек'
              items={receivedFeedback()}
              showRecipient={false}
            />
          </Tabs.Panel>
          <Tabs.Panel value='sent'>
            <FeedbackListPanel
              showRecipient
              emptyText='Вы пока не оставляли фидбек'
              items={sentFeedback()}
            />
          </Tabs.Panel>
          {teamLabel && (
            <Tabs.Panel value='team'>
              <FeedbackListPanel
                showRecipient
                emptyText='Фидбека по сотрудникам пока нет'
                items={teamFeedback()}
              />
            </Tabs.Panel>
          )}
        </Tabs>
      </div>

      <CreateFeedbackModal />
    </>
  );
}, 'Feedback');
