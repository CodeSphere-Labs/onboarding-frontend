import { Badge, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { action, atom, computed, reatomBoolean, wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { IconCalendarPlus, IconPlus } from '@tabler/icons-react';

import type { PeriodPreset } from '../../../Templates/periods';

import {
  dateToDayNumber,
  dayNumberToDate,
  formatDayRange,
  monthPreset,
  parseLocalDate,
  periodDurationDays,
  startOfLocalDay,
  toLocalDateString,
  weekPreset
} from '../../../Templates/periods';
import { addPlanTask, planData, planPeriods } from '../../model';

/**
 * Периоды плана существуют только через задачи (снапшот на задаче),
 * поэтому новый период создаётся сразу с первой задачей.
 * Якорь календаря — дата выхода сотрудника (plan.startsAt) = «день 1».
 */

const modalOpened = reatomBoolean(false, 'plan.periodModalOpened');
const periodName = atom('', 'plan.periodModal.name');
const firstTaskTitle = atom('', 'plan.periodModal.firstTaskTitle');
const anchorDate = atom(startOfLocalDay(), 'plan.periodModal.anchor');
const dateRange = atom<[string | null, string | null]>([null, null], 'plan.periodModal.range');

/** Диапазон дней (1-based от даты выхода), выведенный из выбранных дат */
const selectedDayRange = computed(() => {
  const [from, to] = dateRange();

  if (!from || !to) return undefined;

  const anchor = anchorDate();
  const startDay = dateToDayNumber(anchor, parseLocalDate(from));
  const endDay = dateToDayNumber(anchor, parseLocalDate(to));

  if (startDay < 1 || endDay < startDay) return undefined;

  return { startDay, endDay };
}, 'plan.periodModal.dayRange');

const openPlanPeriodModal = action(() => {
  const plan = planData.data();

  periodName.set('');
  firstTaskTitle.set('');
  anchorDate.set(plan ? parseLocalDate(plan.startsAt) : startOfLocalDay());
  dateRange.set([null, null]);
  modalOpened.setTrue();
}, 'plan.openPeriodModal');

const applyPreset = action((preset: PeriodPreset) => {
  const anchor = anchorDate();

  periodName.set(preset.name);
  dateRange.set([
    toLocalDateString(dayNumberToDate(anchor, preset.startDay)),
    toLocalDateString(dayNumberToDate(anchor, preset.endDay))
  ]);
}, 'plan.periodModal.applyPreset');

const submitPlanPeriod = action(async () => {
  const range = selectedDayRange();
  const name = periodName().trim();
  const taskTitle = firstTaskTitle().trim();

  if (!name || !range || !taskTitle) return;

  const isDuplicate = planPeriods().some(
    (existing) => existing.name.toLowerCase() === name.toLowerCase()
  );

  if (isDuplicate) {
    // модалка остаётся открытой — ввод не теряется
    notifications.show({ message: `Период «${name}» уже есть в плане`, color: 'red' });

    return;
  }

  await wrap(
    addPlanTask({ name, startDay: range.startDay, endDay: range.endDay }, taskTitle)
  );
  modalOpened.setFalse();
}, 'plan.periodModal.submit');

// ── UI ────────────────────────────────────────────────────────────────────

const MONTH_PRESETS = [1, 2, 3].map(monthPreset);
const WEEK_PRESETS = [1, 2, 3, 4].map(weekPreset);

const PresetChips = reatomComponent(
  ({ presets }: { presets: PeriodPreset[] }) => (
    <Group gap={4}>
      {presets.map((preset) => (
        <Button
          key={preset.name}
          radius='xl'
          size='compact-xs'
          variant='outline'
          onClick={() => applyPreset(preset)}
        >
          {preset.name}
        </Button>
      ))}
    </Group>
  ),
  'PlanPresetChips'
);

const PlanPeriodModal = reatomComponent(() => {
  const range = selectedDayRange();
  const canSubmit = !!range && !!periodName().trim() && !!firstTaskTitle().trim();

  return (
    <Modal
      opened={modalOpened()}
      size='auto'
      title='Новый период плана'
      onClose={() => modalOpened.setFalse()}
    >
      <Stack gap='sm'>
        <TextInput
          data-autofocus
          label='Название периода'
          placeholder='Например, «Погружение в проект»'
          value={periodName()}
          onChange={(event) => periodName.set(event.currentTarget.value)}
        />

        <div>
          <Text fw={500} fz='sm' mb={4}>
            Быстрый выбор
          </Text>
          <Group align='flex-start' gap='lg'>
            <div>
              <Text c='dimmed' fw={700} fz={10} mb={4} tt='uppercase'>
                Месяцы работы
              </Text>
              <PresetChips presets={MONTH_PRESETS} />
            </div>
            <div>
              <Text c='dimmed' fw={700} fz={10} mb={4} tt='uppercase'>
                Недели работы
              </Text>
              <PresetChips presets={WEEK_PRESETS} />
            </div>
          </Group>
        </div>

        <div>
          <Text fw={500} fz='sm' mb={4}>
            Диапазон дат{' '}
            <Text span c='dimmed' fz='xs'>
              (отсчёт от даты выхода сотрудника — день 1)
            </Text>
          </Text>
          <DatePicker
            defaultDate={anchorDate()}
            minDate={anchorDate()}
            numberOfColumns={2}
            type='range'
            value={dateRange()}
            onChange={(value) => dateRange.set(value)}
          />
        </div>

        <TextInput
          label='Первая задача периода'
          placeholder='Например, «Встреча с командой проекта»'
          value={firstTaskTitle()}
          onChange={(event) => firstTaskTitle.set(event.currentTarget.value)}
        />

        <Group justify='space-between'>
          {range ? (
            <Badge size='lg' variant='light'>
              {formatDayRange(range)} · {periodDurationDays(range)} дн.
            </Badge>
          ) : (
            <Text c='dimmed' fz='sm'>
              Выберите начало и конец периода
            </Text>
          )}
          <Group gap='xs'>
            <Button variant='default' onClick={() => modalOpened.setFalse()}>
              Отмена
            </Button>
            <Button
              disabled={!canSubmit}
              leftSection={<IconCalendarPlus size={16} />}
              loading={!!addPlanTask.pending()}
              onClick={() => submitPlanPeriod()}
            >
              Добавить период
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}, 'PlanPeriodModal');

export const AddPlanPeriodButton = reatomComponent(
  () => (
    <>
      <Button
        leftSection={<IconPlus size={14} />}
        size='xs'
        variant='default'
        onClick={() => openPlanPeriodModal()}
      >
        Добавить период
      </Button>
      <PlanPeriodModal />
    </>
  ),
  'AddPlanPeriodButton'
);
