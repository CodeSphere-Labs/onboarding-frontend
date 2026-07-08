import type { SubmitEventHandler } from 'react';

import {
  Alert,
  Avatar,
  Button,
  Group,
  Paper,
  PasswordInput,
  SegmentedControl,
  SimpleGrid,
  Text,
  useMantineColorScheme
} from '@mantine/core';
import { bindField, reatomComponent } from '@reatom/react';
import { IconInfoCircle, IconKey, IconPalette, IconUser } from '@tabler/icons-react';

import { user } from '@/app/user.model';
import { UserRoleBadge } from '@/shared/components';

import { changePasswordForm } from './model';

const handleSubmit: SubmitEventHandler = (event) => {
  event.preventDefault();
  changePasswordForm.submit();
};

const SectionHeader = ({
  icon: Icon,
  title
}: {
  icon: typeof IconUser;
  title: string;
}) => (
  <Group gap={8} mb='sm'>
    <Icon opacity={0.6} size={18} />
    <Text fw={700} fz='sm'>
      {title}
    </Text>
  </Group>
);

const ProfileSection = reatomComponent(() => {
  const currentUser = user();

  if (!currentUser) return null;

  const fullName =
    `${currentUser.lastName} ${currentUser.firstName} ${currentUser.patronymic ?? ''}`.trim();

  return (
    <Paper withBorder p='md' radius='md'>
      <SectionHeader icon={IconUser} title='Профиль' />
      <Group gap='md'>
        <Avatar color='initials' name={fullName} size={52} />
        <div>
          <Text fw={600}>{fullName}</Text>
          <Text c='dimmed' fz='sm'>
            {currentUser.email}
          </Text>
          <Group gap={6} mt={4}>
            <UserRoleBadge role={currentUser.role} />
          </Group>
        </div>
      </Group>
      <Alert color='gray' icon={<IconInfoCircle size={16} />} mt='md' radius='md' variant='light'>
        Данные профиля (ФИО, email, отдел, должность) изменяет HR-менеджер.
      </Alert>
    </Paper>
  );
}, 'ProfileSection');

const PasswordSection = reatomComponent(
  () => (
    <Paper withBorder p='md' radius='md'>
      <SectionHeader icon={IconKey} title='Смена пароля' />
      <form onSubmit={handleSubmit}>
        <PasswordInput
          withAsterisk
          autoComplete='current-password'
          label='Текущий пароль'
          {...bindField(changePasswordForm.fields.currentPassword)}
        />
        <PasswordInput
          withAsterisk
          autoComplete='new-password'
          label='Новый пароль'
          mt='sm'
          {...bindField(changePasswordForm.fields.newPassword)}
        />
        <PasswordInput
          withAsterisk
          autoComplete='new-password'
          label='Подтверждение нового пароля'
          mt='sm'
          {...bindField(changePasswordForm.fields.confirmPassword)}
        />
        <Group justify='flex-end' mt='md'>
          <Button loading={!!changePasswordForm.submit.pending()} type='submit'>
            Сменить пароль
          </Button>
        </Group>
      </form>
    </Paper>
  ),
  'PasswordSection'
);

const ThemeSection = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Paper withBorder p='md' radius='md'>
      <SectionHeader icon={IconPalette} title='Тема оформления' />
      <SegmentedControl
        fullWidth
        data={[
          { value: 'light', label: 'Светлая' },
          { value: 'auto', label: 'Как в системе' },
          { value: 'dark', label: 'Тёмная' }
        ]}
        value={colorScheme}
        onChange={(value) => setColorScheme(value as 'auto' | 'dark' | 'light')}
      />
      <Text c='dimmed' fz='xs' mt='xs'>
        Настройка сохраняется в этом браузере.
      </Text>
    </Paper>
  );
};

export const Settings = reatomComponent(
  () => (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <div>
        <ProfileSection />
      </div>
      <div>
        <PasswordSection />
        <div style={{ marginTop: 16 }}>
          <ThemeSection />
        </div>
      </div>
    </SimpleGrid>
  ),
  'Settings'
);
