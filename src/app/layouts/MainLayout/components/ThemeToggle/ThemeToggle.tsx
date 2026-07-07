import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessUp, IconMoonStars } from '@tabler/icons-react';

export const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      aria-label='Переключить тему'
      size='lg'
      variant='default'
      onClick={toggleColorScheme}
    >
      {colorScheme === 'dark' ? <IconBrightnessUp stroke={1} /> : <IconMoonStars stroke={1} />}
    </ActionIcon>
  );
};
