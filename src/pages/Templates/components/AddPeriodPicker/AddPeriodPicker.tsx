import { Button, Popover, Text } from '@mantine/core';
import { reatomBoolean } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { IconPlus } from '@tabler/icons-react';

import type { OnboardingPeriod } from '../../periods';

import { addPeriod, templatePeriods } from '../../model';
import { getPeriodMeta, PERIOD_ORDER } from '../../periods';

import classes from './addPeriodPicker.module.css';

const pickerOpened = reatomBoolean(false, 'templates.periodPickerOpened');

const PeriodChips = reatomComponent(
  ({ periods }: { periods: OnboardingPeriod[] }) => (
    <div className={classes.chips}>
      {periods.map((period) => {
        const meta = getPeriodMeta(period);

        return (
          <Button
            key={period}
            color={meta.color}
            radius='xl'
            size='compact-xs'
            variant='outline'
            onClick={() => {
              addPeriod(period);
              pickerOpened.setFalse();
            }}
          >
            {meta.label}
          </Button>
        );
      })}
    </div>
  ),
  'PeriodChips'
);

export const AddPeriodPicker = reatomComponent(() => {
  const activePeriods = templatePeriods();
  const availablePeriods = PERIOD_ORDER.filter((period) => !activePeriods.includes(period));

  if (availablePeriods.length === 0) return null;

  const weeks = availablePeriods.filter((period) => getPeriodMeta(period).group === 'week');
  const months = availablePeriods.filter((period) => getPeriodMeta(period).group === 'month');

  return (
    <Popover
      withArrow
      opened={pickerOpened()}
      position='bottom-start'
      shadow='md'
      width={260}
      onDismiss={() => pickerOpened.setFalse()}
    >
      <Popover.Target>
        <Button
          leftSection={<IconPlus size={14} />}
          size='xs'
          variant='default'
          onClick={() => pickerOpened.toggle()}
        >
          Добавить период
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        {weeks.length > 0 && (
          <>
            <Text c='dimmed' fw={700} fz={10} mb={4} tt='uppercase'>
              Недели
            </Text>
            <PeriodChips periods={weeks} />
          </>
        )}
        {months.length > 0 && (
          <>
            <Text c='dimmed' fw={700} fz={10} mb={4} mt={weeks.length > 0 ? 'sm' : 0} tt='uppercase'>
              Месяцы
            </Text>
            <PeriodChips periods={months} />
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}, 'AddPeriodPicker');
