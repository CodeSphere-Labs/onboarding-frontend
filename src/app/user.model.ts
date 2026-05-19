import type { AuthenticatedUserResponseDto } from '@api';

import { atom } from '@reatom/core';

export const user = atom<AuthenticatedUserResponseDto | undefined>(undefined, 'user');
