import { Alert, Avatar, Button, CopyButton, Group, Modal, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconAlertTriangle, IconCheck, IconCopy, IconKey } from '@tabler/icons-react';

import {
  closeResetPasswordModal,
  fullName,
  resetPasswordResult,
  resettingUser,
  resetUserPassword
} from '../../model';

import classes from './resetPasswordModal.module.css';

const ResetPasswordConfirmStep = reatomComponent(() => {
  const current = resettingUser();

  if (!current) return null;

  return (
    <>
      <Alert
        color='orange'
        icon={<IconAlertTriangle size={16} />}
        radius='md'
        title='Текущий пароль перестанет работать'
        variant='light'
      >
        Будет сгенерирован новый временный пароль, все активные сессии пользователя завершатся.
        При следующем входе {fullName(current)} должен будет задать новый пароль.
      </Alert>

      <Group justify='flex-end' mt='lg'>
        <Button variant='default' onClick={() => closeResetPasswordModal()}>
          Отмена
        </Button>
        <Button
          color='orange'
          leftSection={<IconKey size={16} />}
          loading={!!resetUserPassword.pending()}
          onClick={() => resetUserPassword(current)}
        >
          Сбросить пароль
        </Button>
      </Group>
    </>
  );
}, 'ResetPasswordConfirmStep');

const ResetPasswordResultStep = reatomComponent(() => {
  const result = resetPasswordResult();

  if (!result) return null;

  return (
    <>
      <Alert color='green' icon={<IconCheck size={16} />} radius='md' title='Пароль сброшен'>
        {fullName(result.user)} · {result.user.email}
      </Alert>

      <Text fw={600} fz='sm' mt='lg'>
        Новый временный пароль
      </Text>
      <Text c='dimmed' fz='xs' mb='sm'>
        Передайте пароль сотруднику лично. После первого входа он задаст собственный пароль.
      </Text>

      <div className={classes.passwordBox}>
        <div>
          <Text c='dimmed' fz='xs'>
            Пароль для первого входа
          </Text>
          <div className={classes.passwordCode}>{result.temporaryPassword}</div>
        </div>
        <CopyButton value={result.temporaryPassword}>
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
        <Button onClick={() => closeResetPasswordModal()}>Готово</Button>
      </Group>
    </>
  );
}, 'ResetPasswordResultStep');

export const ResetPasswordModal = reatomComponent(() => {
  const current = resettingUser();

  return (
    <Modal
      centered
      title={
        current && (
          <Group gap='xs'>
            <Avatar color='initials' name={fullName(current)} size={28} />
            <div>
              <Text fw={700} fz='sm'>
                Сброс пароля
              </Text>
              <Text c='dimmed' fz='xs'>
                {fullName(current)} · {current.email}
              </Text>
            </div>
          </Group>
        )
      }
      opened={!!current}
      onClose={() => closeResetPasswordModal()}
    >
      {resetPasswordResult() ? <ResetPasswordResultStep /> : <ResetPasswordConfirmStep />}
    </Modal>
  );
}, 'ResetPasswordModal');
