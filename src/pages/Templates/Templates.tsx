import type { OnboardingTemplateResponseDto } from '@api';

import {
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import {
  IconCalendar,
  IconCalendarPlus,
  IconCopy,
  IconFiles,
  IconListCheck,
  IconPlus,
  IconSearch
} from '@tabler/icons-react';

import { AddPeriodPicker } from './components/AddPeriodPicker/AddPeriodPicker';
import { CreateTemplateModal } from './components/CreateTemplateModal/CreateTemplateModal';
import { PeriodSection } from './components/PeriodSection/PeriodSection';
import { TaskModal } from './components/TaskModal/TaskModal';
import { getDepartmentMeta } from './departmentMeta';
import {
  asText,
  departmentNameById,
  duplicateTemplate,
  groupedTemplates,
  openCreateModal,
  searchQuery,
  selectedTemplate,
  selectedTemplateId,
  tasksByPeriod,
  templateDepartmentName,
  templatePeriods,
  templatesList
} from './model';
import { getPeriodColor } from './periods';

import classes from './templates.module.css';

const pluralizePeriods = (count: number) => {
  if (count === 1) return 'период';
  if (count >= 2 && count <= 4) return 'периода';

  return 'периодов';
};

const TemplateListItem = reatomComponent(
  ({ template }: { template: OnboardingTemplateResponseDto }) => {
    const meta = getDepartmentMeta(templateDepartmentName(template, departmentNameById()));
    const periodsCount = template.periods.length;

    return (
      <button
        className={classes.item}
        data-active={selectedTemplateId() === template.id || undefined}
        type='button'
        onClick={() => selectedTemplateId.set(template.id)}
      >
        <ThemeIcon color={meta.color} radius='md' size={34} variant='light'>
          <meta.icon size={17} />
        </ThemeIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={classes.itemName}>{template.name}</div>
          <Text c='dimmed' fz={11}>
            {template.tasks.length} задач · {periodsCount} {pluralizePeriods(periodsCount)}
          </Text>
        </div>
      </button>
    );
  },
  'TemplateListItem'
);

const TemplatesListPane = reatomComponent(() => {
  const groups = groupedTemplates();

  return (
    <div className={classes.listPane}>
      <div className={classes.listHeader}>Шаблоны ({templatesList.data().length})</div>
      <div className={classes.listSearch}>
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder='Поиск…'
          size='xs'
          value={searchQuery()}
          onChange={(event) => searchQuery.set(event.currentTarget.value)}
        />
      </div>
      <div className={classes.listScroll}>
        {groups.map(([departmentName, templates]) => (
          <div key={departmentName}>
            <div className={classes.deptLabel}>{departmentName}</div>
            {templates.map((template) => (
              <TemplateListItem key={template.id} template={template} />
            ))}
          </div>
        ))}
        {groups.length === 0 && (
          <Text c='dimmed' fz='sm' p='xl' ta='center'>
            Шаблоны не найдены
          </Text>
        )}
      </div>
    </div>
  );
}, 'TemplatesListPane');

const TemplateDetail = reatomComponent(() => {
  const template = selectedTemplate();

  if (!template) {
    return (
      <div className={classes.emptyDetail}>
        <IconFiles opacity={0.3} size={48} />
        <Text fw={600} fz='sm'>
          Выберите шаблон
        </Text>
        <Text c='dimmed' fz='sm'>
          Выберите шаблон слева или создайте новый
        </Text>
      </div>
    );
  }

  const departmentName = templateDepartmentName(template, departmentNameById());
  const meta = getDepartmentMeta(departmentName);
  const description = asText(template.description);
  const periods = templatePeriods();
  const periodTasks = tasksByPeriod();

  return (
    <>
      <div className={classes.detailHeader}>
        <Group align='flex-start' justify='space-between'>
          <Group gap={12}>
            <ThemeIcon color={meta.color} radius='md' size={44} variant='light'>
              <meta.icon size={22} />
            </ThemeIcon>
            <div>
              <Title fw={700} order={4}>
                {template.name}
              </Title>
              {description && (
                <Text c='dimmed' fz='sm' mt={2}>
                  {description}
                </Text>
              )}
            </div>
          </Group>
          <Button
            leftSection={<IconCopy size={14} />}
            loading={!!duplicateTemplate.pending()}
            size='xs'
            variant='default'
            onClick={() => duplicateTemplate()}
          >
            Дублировать
          </Button>
        </Group>

        <Group gap={12} mt={14}>
          {departmentName && (
            <Badge color={meta.color} size='sm' variant='light'>
              {departmentName}
            </Badge>
          )}
          <Group c='dimmed' fz={12} gap={4}>
            <IconListCheck size={14} />
            {template.tasks.length} задач
          </Group>
          <Group c='dimmed' fz={12} gap={4}>
            <IconCalendar size={14} />
            {periods.length} {pluralizePeriods(periods.length)}
          </Group>
        </Group>
      </div>

      <div className={classes.detailContent}>
        {periods.length > 0 && (
          <Group gap={6} mb='lg'>
            {periods.map((period) => {
              const color = getPeriodColor(period);
              const count = periodTasks.get(period.id)?.length ?? 0;

              return (
                <div
                  key={period.id}
                  className={classes.periodCard}
                  style={{ borderTopColor: `var(--mantine-color-${color}-6)` }}
                >
                  <Text c='dimmed' fz={11}>
                    {period.name}
                  </Text>
                  <Text c={`${color}.6`} fw={700} fz={18} lh={1}>
                    {count}
                  </Text>
                  <Text c='dimmed' fz={10}>
                    задач
                  </Text>
                </div>
              );
            })}
          </Group>
        )}

        {periods.length === 0 && (
          <div className={classes.emptyPeriods}>
            <IconCalendarPlus opacity={0.5} size={36} />
            <Text fw={600} fz='sm' mt={10}>
              Нет периодов
            </Text>
            <Text c='dimmed' fz='sm' mb='md' mt={6}>
              Добавьте периоды, чтобы начать заполнять план
            </Text>
            <AddPeriodPicker />
          </div>
        )}

        {periods.map((period) => (
          <PeriodSection key={period.id} period={period} tasks={periodTasks.get(period.id) ?? []} />
        ))}

        {periods.length > 0 && <AddPeriodPicker />}
      </div>
    </>
  );
}, 'TemplateDetail');

export const Templates = reatomComponent(
  () => (
    <div className={classes.page}>
      <Group justify='flex-end' mb='md'>
        <Button leftSection={<IconPlus size={16} />} onClick={() => openCreateModal()}>
          Новый шаблон
        </Button>
      </Group>

      <div className={classes.root}>
        <LoadingOverlay visible={!templatesList.ready()} zIndex={10} />
        <TemplatesListPane />
        <div className={classes.detailPane}>
          <TemplateDetail />
        </div>
      </div>

      <CreateTemplateModal />
      <TaskModal />
    </div>
  ),
  'Templates'
);
