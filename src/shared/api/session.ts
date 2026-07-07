import { instance } from '@api';

import { router } from '@/app/router';
import { user } from '@/app/user.model';

// Бэкенд сам ротирует токены через httpOnly-куки. Сюда попадает только
// невосстановимый 401 — сессия истекла или ревокнута.
instance.interceptors.response.use(undefined, (error) => {
  if (error?.response?.status === 401 && user()) {
    user.set(undefined);
    router.login.go(undefined, true);
  }

  return Promise.reject(error);
});
