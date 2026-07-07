import type { SubmitEventHandler } from 'react';

import {
  Alert,
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconInfoCircle, IconLock, IconMail } from '@tabler/icons-react';

import { isLoading, loginForm, showForgotPasswordHint } from './model';

import classes from './login.module.css';

const handleSubmit: SubmitEventHandler = (e) => {
  e.preventDefault();
  loginForm.submit();
};

export const Login = reatomComponent(() => {
  const emailField = bindField(loginForm.fields.email);
  const passwordField = bindField(loginForm.fields.password);

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
            Вход в систему
          </Title>
          <Text className={classes.cardSubtitle}>Используйте корпоративные данные для входа</Text>

          <TextInput
            required
            autoComplete='email'
            label='Корпоративный email'
            leftSection={<IconMail size={18} stroke={1.5} />}
            mt='lg'
            placeholder='you@company.ru'
            radius='md'
            type='email'
            {...emailField}
          />
          <PasswordInput
            required
            autoComplete='current-password'
            label='Пароль'
            leftSection={<IconLock size={18} stroke={1.5} />}
            mt='md'
            placeholder='Введите пароль'
            radius='md'
            {...passwordField}
          />

          <Group justify='flex-end' mt='xs'>
            <Anchor component='button' size='sm' type='button' onClick={showForgotPasswordHint}>
              Забыли пароль?
            </Anchor>
          </Group>

          <Button fullWidth loading={isLoading()} mt='md' radius='md' size='md' type='submit'>
            Войти
          </Button>

          <Alert
            className={classes.hint}
            color='gray'
            icon={<IconInfoCircle size={16} />}
            mt='lg'
            radius='md'
            variant='light'
          >
            Учётная запись создаётся HR-менеджером. Логин и временный пароль передаются лично при
            выходе на работу.
          </Alert>
        </Paper>

        <Text className={classes.footerNote}>Проблемы со входом? Обратитесь к HR-менеджеру</Text>
      </div>
    </div>
  );
}, 'Login');
