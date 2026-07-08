import type { Icon } from '@tabler/icons-react';

import {
  IconBug,
  IconChartBar,
  IconCode,
  IconFiles,
  IconPalette,
  IconRocket,
  IconSpeakerphone,
  IconUsers
} from '@tabler/icons-react';

export interface DepartmentMeta {
  color: string;
  icon: Icon;
}

/** Цвета/иконки отделов из дизайна Templates; неизвестные отделы получают fallback */
const DEPARTMENT_META: Record<string, DepartmentMeta> = {
  Дизайн: { color: 'violet', icon: IconPalette },
  Разработка: { color: 'blue', icon: IconCode },
  Продукт: { color: 'teal', icon: IconRocket },
  Аналитика: { color: 'indigo', icon: IconChartBar },
  HR: { color: 'grape', icon: IconUsers },
  QA: { color: 'orange', icon: IconBug },
  Маркетинг: { color: 'green', icon: IconSpeakerphone }
};

const FALLBACK_META: DepartmentMeta = { color: 'gray', icon: IconFiles };

export const getDepartmentMeta = (departmentName: string | undefined): DepartmentMeta =>
  (departmentName && DEPARTMENT_META[departmentName]) || FALLBACK_META;
