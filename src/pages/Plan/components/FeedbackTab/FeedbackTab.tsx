import type { FeedbackResponseDto } from '@api';

import { Badge, Group, LoadingOverlay, Paper, Text } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconArrowDown, IconArrowUp, IconSpy } from '@tabler/icons-react';

import { planFeedback } from '../../model';

import classes from './feedbackTab.module.css';

const FeedbackCard = ({ item }: { item: FeedbackResponseDto }) => (
  <Paper withBorder mb='xs' p='md' radius='md'>
    <Group gap='xs' justify='space-between' mb='sm'>
      <Badge color='gray' leftSection={<IconSpy size={12} />} size='sm' variant='light'>
        Аноним
      </Badge>
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
);

/** Анонимный фидбек, полученный сотрудником, — прямо на странице плана */
export const FeedbackTab = reatomComponent(() => {
  const items = planFeedback.data();

  return (
    <div style={{ position: 'relative', minHeight: 80 }}>
      <LoadingOverlay visible={!planFeedback.ready()} zIndex={10} />

      {items.map((item) => (
        <FeedbackCard key={item.id} item={item} />
      ))}

      {planFeedback.ready() && items.length === 0 && (
        <Text c='dimmed' fz='sm' py='xl' ta='center'>
          Сотруднику пока не оставляли фидбек
        </Text>
      )}
    </div>
  );
}, 'PlanFeedbackTab');
