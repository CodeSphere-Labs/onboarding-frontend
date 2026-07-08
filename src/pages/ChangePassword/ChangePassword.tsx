import type { SubmitEventHandler } from 'react';

import { Alert, Button, Paper, PasswordInput, Text, Title } from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconInfoCircle, IconKey, IconLock, IconLogout } from '@tabler/icons-react';

import { logout } from '@/app/user.model';

import { changePasswordForm, isLoading } from './model';

import classes from './changePassword.module.css';

const handleSubmit: SubmitEventHandler = (e) => {
  e.preventDefault();
  changePasswordForm.submit();
};

export const ChangePassword = reatomComponent(() => {
  const currentPasswordField = bindField(changePasswordForm.fields.currentPassword);
  const newPasswordField = bindField(changePasswordForm.fields.newPassword);
  const confirmPasswordField = bindField(changePasswordForm.fields.confirmPassword);

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        <div className={classes.brand}>
          <div className={classes.logoMark}>O</div>
          <Title className={classes.logoText} order={3}>
            Onboard<span className={classes.logoAccent}>Pro</span>
          </Title>
        </div>
        <Text className={classes.tagline}>Корпоративная система адаптации</Text>

        <Paper
          withBorder
          className={classes.card}
          component='form'
          radius='lg'
          shadow='md'
          onSubmit={handleSubmit}
        >
          <Title className={classes.cardTitle} order={4}>
            Смена временного пароля
          </Title>
          <Text className={classes.cardSubtitle}>
            Вы вошли с временным паролем — задайте собственный, чтобы продолжить работу
          </Text>

          <PasswordInput
            required
            autoComplete='current-password'
            label='Временный пароль'
            leftSection={<IconKey size={18} stroke={1.5} />}
            mt='lg'
            placeholder='Введите временный пароль'
            radius='md'
            {...currentPasswordField}
          />
          <PasswordInput
            required
            autoComplete='new-password'
            label='Новый пароль'
            leftSection={<IconLock size={18} stroke={1.5} />}
            mt='md'
            placeholder='Минимум 8 символов'
            radius='md'
            {...newPasswordField}
          />
          <PasswordInput
            required
            autoComplete='new-password'
            label='Подтверждение пароля'
            leftSection={<IconLock size={18} stroke={1.5} />}
            mt='md'
            placeholder='Повторите новый пароль'
            radius='md'
            {...confirmPasswordField}
          />

          <Button fullWidth loading={isLoading()} mt='lg' radius='md' size='md' type='submit'>
            Сменить пароль
          </Button>

          <Alert
            color='gray'
            icon={<IconInfoCircle size={16} />}
            mt='lg'
            radius='md'
            variant='light'
          >
            Временный пароль выдаётся HR-менеджером и действует только для первого входа.
          </Alert>

          <Button
            fullWidth
            color='gray'
            leftSection={<IconLogout size={16} stroke={1.5} />}
            loading={!!logout.pending()}
            mt='md'
            size='sm'
            type='button'
            variant='subtle'
            onClick={() => logout()}
          >
            Выйти
          </Button>
        </Paper>

        <Text className={classes.footerNote}>Проблемы со входом? Обратитесь к HR-менеджеру</Text>
      </div>
    </div>
  );
}, 'ChangePassword');
