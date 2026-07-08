import type { CreateUserResponseDto } from '@api';
import type { ApicraftFetchesResponse, FetchesRequestParams } from '@siberiacancode/apicraft';

import { instance } from '@api';

/**
 * Временная ручная обёртка: эндпоинт POST /api/users/:id/reset-password добавлен
 * на бэкенде (OSS-23), но клиент ещё не перегенерирован из OpenAPI.
 * После мержа бэкенда удалить файл и перейти на сгенерированный
 * postApiUserByIdResetPassword из '@api' (pnpm generate:api).
 */

export type ResetUserPasswordResponseDto = CreateUserResponseDto;

interface PostApiUserByIdResetPasswordData {
  body?: never;
  path: {
    id: string;
  };
  query?: never;
  url: '/api/users/{id}/reset-password';
}

export type PostApiUserByIdResetPasswordRequestParams =
  FetchesRequestParams<PostApiUserByIdResetPasswordData>;

export const postApiUserByIdResetPassword = ({
  config,
  path
}: PostApiUserByIdResetPasswordRequestParams): Promise<
  ApicraftFetchesResponse<ResetUserPasswordResponseDto>
> => instance.call('POST', `/api/users/${path.id}/reset-password`, { ...config });
