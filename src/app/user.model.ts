import type { AuthenticatedUserResponseDto } from '@api';

import { postApiAuthLogout } from '@api';
import { action, atom, withAsync, wrap } from '@reatom/core';

import { router } from './router';

export const user = atom<AuthenticatedUserResponseDto | undefined>(undefined, 'user');

export const logout = action(async () => {
  try {
    await wrap(postApiAuthLogout());
  } finally {
    user.set(undefined);
    router.login.go(undefined, true);
  }
}, 'logout').extend(withAsync());
