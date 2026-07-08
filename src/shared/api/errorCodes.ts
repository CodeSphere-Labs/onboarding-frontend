import type { ResponseError } from '@siberiacancode/fetches';

export const errorCodeMessages = {
  bad_request: 'Некорректный запрос',
  unauthorized: 'Необходимо войти в систему',
  not_found: 'Запрошенный ресурс не найден',
  already_exist: 'Такая запись уже существует',
  forbidden: 'Недостаточно прав для выполнения действия',

  invalid_credentials: 'Неверный логин или пароль',
  token_expired: 'Сессия истекла, войдите снова',
  invalid_token: 'Некорректная сессия, войдите снова',
  account_disabled: 'Аккаунт отключен',
  invalid_role: 'Некорректная роль пользователя',

  user_not_found: 'Пользователь не найден',
  user_already_exists: 'Пользователь уже существует',
  department_not_found: 'Отдел не найден',
  position_not_found: 'Должность не найдена',
  department_already_exists: 'Отдел уже существует',
  position_already_exists: 'Должность уже существует',
  onboarding_template_not_found: 'Шаблон онбординга не найден',
  onboarding_plan_not_found: 'План онбординга не найден',
  onboarding_task_not_found: 'Задача онбординга не найдена',
  active_onboarding_plan_already_exists: 'У пользователя уже есть активный план онбординга',
  goal_not_found: 'Цель не найдена',
  achievement_not_found: 'Достижение не найдено',
  feedback_not_found: 'Обратная связь не найдена',
  notification_not_found: 'Уведомление не найдено',
  welcome_pack_template_not_found: 'Шаблон welcome pack не найден',
  welcome_pack_not_found: 'Welcome pack не найден'
} as const;

export type ErrorCode = keyof typeof errorCodeMessages;

export type ApiErrorCode = (string & {}) | ErrorCode;

export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  path: string;
  statusCode: number;
  timestamp: string;
}

export type ApiError = Omit<ResponseError, 'response'> & {
  response: Omit<ResponseError['response'], 'data'> & {
    data: ApiErrorResponse;
  };
};

const FALLBACK_API_ERROR: ApiErrorResponse = {
  code: 'unknown_error',
  message: 'Что-то пошло не так. Попробуйте ещё раз',
  path: '',
  statusCode: 0,
  timestamp: ''
};

/** Устойчив к не-API ошибкам (TypeError и т.п.): без валидной структуры — generic */
export const getApiError = (error: unknown): ApiErrorResponse => {
  const data = (error as Partial<ApiError>)?.response?.data;

  if (data && typeof data === 'object' && typeof data.code === 'string') {
    return data;
  }

  return FALLBACK_API_ERROR;
};

export const getErrorCodeMessage = (code?: string | null, fallback = 'Произошла ошибка') => {
  if (!code) return fallback;

  return errorCodeMessages[code as ErrorCode] ?? fallback;
};
