/**
 * Хелперы пользовательских периодов: период — это название + диапазон дней
 * от даты выхода сотрудника (1-based, границы включительно).
 * TODO(OSS-16): поднять в shared, если появится третий потребитель.
 */

export interface PeriodRange {
  endDay: number;
  startDay: number;
}

export const periodDurationDays = ({ endDay, startDay }: PeriodRange) =>
  Math.max(1, endDay - startDay + 1);

export const formatDayRange = ({ endDay, startDay }: PeriodRange) =>
  startDay === endDay ? `День ${startDay}` : `Дни ${startDay}–${endDay}`;

/** Цвет по длительности: недельные — синие, месячные — фиолетовые, длиннее — бирюзовые */
export const getPeriodColor = (period: PeriodRange) => {
  const duration = periodDurationDays(period);

  if (duration <= 7) return 'blue';
  if (duration <= 14) return 'cyan';
  if (duration <= 31) return 'violet';

  return 'teal';
};

export const sortPeriodRanges = <Period extends PeriodRange & { name: string }>(
  periods: Period[]
): Period[] =>
  periods.toSorted(
    (left, right) =>
      left.startDay - right.startDay ||
      left.endDay - right.endDay ||
      left.name.localeCompare(right.name, 'ru')
  );

// ── Пресеты для быстрого выбора диапазона ─────────────────────────────────

export interface PeriodPreset extends PeriodRange {
  name: string;
}

/** Месяц N работы сотрудника: дни (N-1)·30+1 … N·30 */
export const monthPreset = (monthNumber: number): PeriodPreset => ({
  name: `Месяц ${monthNumber}`,
  startDay: (monthNumber - 1) * 30 + 1,
  endDay: monthNumber * 30
});

/** Неделя N работы сотрудника: дни (N-1)·7+1 … N·7 */
export const weekPreset = (weekNumber: number): PeriodPreset => ({
  name: `Неделя ${weekNumber}`,
  startDay: (weekNumber - 1) * 7 + 1,
  endDay: weekNumber * 7
});

// ── Пересчёт «номер дня ↔ календарная дата» для модалок с DatePicker ──────
// Якорь — «день 1» (дата выхода сотрудника или сегодня для шаблонов).

export const startOfLocalDay = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Календарная арифметика (не мс): устойчиво к переходам на летнее/зимнее время */
export const dayNumberToDate = (anchor: Date, dayNumber: number) =>
  new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayNumber - 1);

/** Mantine DatePicker отдаёт строки YYYY-MM-DD — парсим в локальной TZ, как и якорь */
export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
};

export const toLocalDateString = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const dateToDayNumber = (anchor: Date, date: Date) =>
  Math.round((date.getTime() - anchor.getTime()) / DAY_MS) + 1;

/**
 * Человекочитаемое название enum-периода целей (month_1..month_3).
 * Периоды целей остались enum'ом — в отличие от периодов шаблонов/планов.
 */
export const formatGoalPeriodLabel = (period: string) => {
  const [group, rawNumber] = period.split('_');

  if (group === 'month') return `Месяц ${rawNumber}`;
  if (group === 'week') return `Неделя ${rawNumber}`;

  return period;
};
