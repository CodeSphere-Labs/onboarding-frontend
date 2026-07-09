import { Badge, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { action, atom, computed, reatomBoolean } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { IconCalendarPlus, IconPlus } from '@tabler/icons-react';

import type { PeriodPreset } from '../../periods';

import { addPeriod, saveTemplateStructure } from '../../model';
import { formatDayRange, monthPreset, periodDurationDays, weekPreset } from '../../periods';

import classes from './addPeriodPicker.module.css';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Якорь календаря: сегодня = «день 1» работы сотрудника */
const startOfToday = () => {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Календарная арифметика (не мс): устойчиво к переходам на летнее/зимнее время */
const dayNumberToDate = (anchor: Date, dayNumber: number) =>
  new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayNumber - 1);

/** Mantine DatePicker отдаёт строки YYYY-MM-DD — парсим в локальной TZ, как и якорь */
const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
};

const toDateString = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

const dateToDayNumber = (anchor: Date, date: Date) =>
  Math.round((date.getTime() - anchor.getTime()) / DAY_MS) + 1;

// ── Состояние модалки ─────────────────────────────────────────────────────

const modalOpened = reatomBoolean(false, 'templates.periodModalOpened');
const periodName = atom('', 'templates.periodModal.name');
const anchorDate = atom(startOfToday(), 'templates.periodModal.anchor');
const dateRange = atom<[string | null, string | null]>(
  [null, null],
  'templates.periodModal.range'
);

/** Диапазон дней (1-based от даты выхода), выведенный из выбранных дат */
const selectedDayRange = computed(() => {
  const [from, to] = dateRange();

  if (!from || !to) return undefined;

  const anchor = anchorDate();
  const startDay = dateToDayNumber(anchor, parseLocalDate(from));
  const endDay = dateToDayNumber(anchor, parseLocalDate(to));

  if (startDay < 1 || endDay < startDay) return undefined;

  return { startDay, endDay };
}, 'templates.periodModal.dayRange');

export const openPeriodModal = action(() => {
  periodName.set('');
  anchorDate.set(startOfToday());
  dateRange.set([null, null]);
  modalOpened.setTrue();
}, 'templates.openPeriodModal');

const applyPreset = action((preset: PeriodPreset) => {
  const anchor = anchorDate();

  periodName.set(preset.name);
  dateRange.set([
    toDateString(dayNumberToDate(anchor, preset.startDay)),
    toDateString(dayNumberToDate(anchor, preset.endDay))
  ]);
}, 'templates.periodModal.applyPreset');

const submitPeriod = action(() => {
  const range = selectedDayRange();
  const name = periodName().trim();

  if (!name || !range) return;

  // при дубликате имени модалка остаётся открытой — ввод не теряется
  if (addPeriod({ name, startDay: range.startDay, endDay: range.endDay })) {
    modalOpened.setFalse();
  }
}, 'templates.periodModal.submit');

// ── UI ────────────────────────────────────────────────────────────────────

const MONTH_PRESETS = [1, 2, 3].map(monthPreset);
const WEEK_PRESETS = [1, 2, 3, 4].map(weekPreset);

const PresetChips = reatomComponent(
  ({ presets }: { presets: PeriodPreset[] }) => (
    <div className={classes.chips}>
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
    </div>
  ),
  'PresetChips'
);

const PeriodModal = reatomComponent(() => {
  const range = selectedDayRange();

  return (
    <Modal
      opened={modalOpened()}
      size='auto'
      title='Новый период'
      onClose={() => modalOpened.setFalse()}
    >
      <Stack gap='sm'>
        <TextInput
          data-autofocus
          label='Название периода'
          placeholder='Например, «Первая неделя»'
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
              disabled={!range || !periodName().trim()}
              leftSection={<IconCalendarPlus size={16} />}
              loading={!!saveTemplateStructure.pending()}
              onClick={() => submitPeriod()}
            >
              Добавить период
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}, 'PeriodModal');

export const AddPeriodPicker = reatomComponent(
  () => (
    <>
      <Button
        leftSection={<IconPlus size={14} />}
        size='xs'
        variant='default'
        onClick={() => openPeriodModal()}
      >
        Добавить период
      </Button>
      <PeriodModal />
    </>
  ),
  'AddPeriodPicker'
);
