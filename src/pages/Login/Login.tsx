import type { SubmitEventHandler } from 'react';

import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';

import { isLoading, loginForm } from './model';

import classes from './login.module.css';

const handleSubmit: SubmitEventHandler = (e) => {
  e.preventDefault();
  loginForm.submit();
};

export const Login = reatomComponent(() => {
  const emailField = bindField(loginForm.fields.email);
  const passwordField = bindField(loginForm.fields.password);

  return (
    <Container className={classes.root} size={420}>
      <Title className={classes.title} ta='center'>
        Привет! 👋
      </Title>

      <Text className={classes.subtitle}>Корпоративная система адаптации</Text>

      <Paper
        withBorder
        component='form'
        mt={30}
        p={22}
        radius='md'
        shadow='sm'
        onSubmit={handleSubmit}
      >
        <TextInput
          required
          label='Email'
          placeholder='firstname.lastname@stmlabs.ru'
          radius='md'
          {...emailField}
        />
        <PasswordInput
          required
          label='Password'
          mt='md'
          placeholder='qwerty12345'
          radius='md'
          {...passwordField}
        />
        <Group justify='space-between' mt='lg'>
          <div />
          <Anchor component='button' size='sm'>
            Забыли пароль?
          </Anchor>
        </Group>
        <Button fullWidth loading={isLoading()} mt='sm' radius='md' type='submit'>
          Войти
        </Button>
      </Paper>
    </Container>
  );
});
