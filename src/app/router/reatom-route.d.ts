import type { ReactElement } from 'react';

declare module '@reatom/core' {
  interface RouteChild extends ReactElement {}
}
