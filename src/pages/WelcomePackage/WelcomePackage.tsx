import type { WelcomePackResourceResponseDto } from '@api';

import {
  Anchor,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Text,
  ThemeIcon
} from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconFileText,
  IconGift,
  IconLink,
  IconUserCircle
} from '@tabler/icons-react';

import { user } from '@/app/user.model';

import {
  EmployeeNotSelected,
  EmployeePicker
} from '../Plan/components/EmployeePicker/EmployeePicker';
import { planEmployeeId } from '../Plan/model';
import {
  assignWelcomePack,
  asText,
  packTemplates,
  resourcesByType,
  selectedTemplateId,
  welcomePack
} from './model';

import classes from './welcomePackage.module.css';

const GROUP_META = [
  { type: 'file' as const, title: 'Документы и материалы', icon: IconFileText, color: 'blue' },
  { type: 'link' as const, title: 'Полезные ссылки', icon: IconLink, color: 'teal' },
  { type: 'contact' as const, title: 'Ключевые контакты', icon: IconUserCircle, color: 'violet' }
];

const ResourceRow = ({ resource }: { resource: WelcomePackResourceResponseDto }) => {
  const description = asText(resource.description);
  const url = asText(resource.url);
  const contactName = asText(resource.contactName);
  const contactRole = asText(resource.contactRole);
  const contactEmail = asText(resource.contactEmail);

  return (
    <div className={classes.resource}>
      <Text fw={600} fz='sm'>
        {url ? (
          <Anchor fz='sm' href={url} rel='noreferrer' target='_blank'>
            {resource.title}
          </Anchor>
        ) : (
          resource.title
        )}
      </Text>
      {description && (
        <Text c='dimmed' fz='xs'>
          {description}
        </Text>
      )}
      {(contactName || contactEmail) && (
        <Text c='dimmed' fz='xs'>
          {[contactName, contactRole, contactEmail].filter(Boolean).join(' · ')}
        </Text>
      )}
    </div>
  );
};

const AssignPanel = reatomComponent(() => {
  if (user()?.role !== 'hr') return null;

  return (
    <Paper withBorder mt='md' p='md' radius='md'>
      <Text fw={700} fz='sm' mb='xs'>
        Назначить welcome-пакет
      </Text>
      <Group gap='xs'>
        <Select
          data={packTemplates
            .data()
            .map((template) => ({ value: template.id, label: template.name }))}
          flex={1}
          placeholder='Выберите шаблон пакета'
          value={selectedTemplateId() ?? null}
          onChange={(value) => selectedTemplateId.set(value ?? undefined)}
        />
        <Button loading={!!assignWelcomePack.pending()} onClick={() => assignWelcomePack()}>
          Назначить
        </Button>
      </Group>
    </Paper>
  );
}, 'AssignPanel');

export const WelcomePackage = reatomComponent(() => {
  const currentUser = user();
  const employeeId = planEmployeeId();
  const pack = welcomePack.data();
  const groups = resourcesByType();
  const isEmployee = currentUser?.role === 'employee';

  return (
    <>
      <Group justify='space-between' mb='md'>
        <EmployeePicker />
      </Group>

      <EmployeeNotSelected />

      {employeeId && (
        <div style={{ position: 'relative', minHeight: 120 }}>
          <LoadingOverlay visible={!welcomePack.ready()} zIndex={10} />

          {isEmployee && (
            <div className={classes.banner}>
              <IconGift size={34} />
              <div>
                <Text c='white' fw={700} fz={18}>
                  Добро пожаловать в команду, {currentUser.firstName}!
                </Text>
                <Text c='white' fz='sm' opacity={0.85}>
                  Здесь собраны материалы, ссылки и контакты для вашего первого дня.
                </Text>
              </div>
            </div>
          )}

          {welcomePack.ready() && !pack && (
            <Paper withBorder p='xl' radius='md' ta='center'>
              <IconGift opacity={0.3} size={40} />
              <Text fw={600} fz='sm' mt='xs'>
                Welcome-пакет ещё не назначен
              </Text>
              <Text c='dimmed' fz='sm'>
                {isEmployee
                  ? 'HR назначит вам пакет материалов — загляните позже.'
                  : 'Назначьте сотруднику пакет из шаблона ниже.'}
              </Text>
            </Paper>
          )}

          {pack &&
            GROUP_META.map((groupMeta) => {
              const resources = groups.get(groupMeta.type) ?? [];

              if (resources.length === 0) return null;

              return (
                <Paper withBorder key={groupMeta.type} mb='md' p='md' radius='md'>
                  <Group gap='xs' mb='sm'>
                    <ThemeIcon color={groupMeta.color} radius='md' size={30} variant='light'>
                      <groupMeta.icon size={16} />
                    </ThemeIcon>
                    <Text fw={700} fz='sm'>
                      {groupMeta.title}
                    </Text>
                  </Group>
                  {resources.map((resource) => (
                    <ResourceRow key={resource.id} resource={resource} />
                  ))}
                </Paper>
              );
            })}

          <AssignPanel />
        </div>
      )}
    </>
  );
}, 'WelcomePackage');
