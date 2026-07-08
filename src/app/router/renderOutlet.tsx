import type { RouteChild } from '@reatom/core';

import { Fragment } from 'react';

/**
 * `outlet()` у reatomRoute возвращает массив отрендеренных детей без `key`,
 * из-за чего React пишет предупреждение «Each child in a list should have a
 * unique key prop». Оборачиваем детей во Fragment с ключом по индексу —
 * порядок детей стабилен (определяется деревом роутов), а активен обычно
 * один child.
 */
export const renderOutlet = (children: RouteChild[]) =>
  // eslint-disable-next-line react/no-array-index-key -- порядок детей outlet стабилен и задаётся деревом роутов, id у RouteChild нет
  children.map((child, index) => <Fragment key={index}>{child}</Fragment>);
