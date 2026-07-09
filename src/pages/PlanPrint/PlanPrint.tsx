import { Button } from '@mantine/core';
import { reatomComponent } from '@reatom/react';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';

import { router } from '@/app/router';
import { user } from '@/app/user.model';

import {
  planData,
  planDayInfo,
  planEmployeeId,
  planPeriods,
  planProgress,
  planTasksByPeriod,
  summarizeTasks,
  viewedEmployeeName
} from '../Plan/model';
import { formatDayRange } from '../Templates/periods';

import classes from './planPrint.module.css';

/**
 * Печатная A4-версия онбординг-плана (PRD: экспорт в PDF через печать браузера).
 * Рендерится вне MainLayout; window.print() вызывается автоматически после
 * загрузки данных (и повторно доступен кнопкой).
 */
export const PlanPrint = reatomComponent(() => {
  const plan = planData.data();
  const ready = planData.ready();
  const printedRef = useRef(false);

  useEffect(() => {
    if (ready && plan && !printedRef.current) {
      printedRef.current = true;
      // даём браузеру дорисовать страницу перед диалогом печати
      const timer = setTimeout(() => window.print(), 400);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [ready, plan]);

  if (!ready) {
    return <div className={classes.page}>Загрузка…</div>;
  }

  if (!plan) {
    return (
      <div className={classes.page}>
        <p>План не выбран. Откройте страницу «План» и выберите сотрудника.</p>
        <Button variant='default' onClick={() => router.plan.go({ employeeId: undefined })}>
          К странице плана
        </Button>
      </div>
    );
  }

  const name = viewedEmployeeName() || 'Сотрудник';
  const progress = planProgress();
  const dayInfo = planDayInfo();
  const periods = planPeriods();
  const tasksByPeriod = planTasksByPeriod();
  const currentUser = user();

  return (
    <div className={classes.page}>
      <div className={classes.toolbar}>
        <Button
          leftSection={<IconArrowLeft size={14} />}
          size='xs'
          variant='default'
          onClick={() => router.plan.go({ employeeId: planEmployeeId() })}
        >
          Назад к плану
        </Button>
        <Button
          leftSection={<IconPrinter size={14} />}
          size='xs'
          onClick={() => window.print()}
        >
          Распечатать
        </Button>
      </div>

      <header className={classes.docHeader}>
        <div className={classes.logo}>
          <span className={classes.logoMark}>O</span>
          Onboard<span className={classes.logoAccent}>Pro</span>
        </div>
        <div className={classes.docMeta}>
          <div className={classes.docTitle}>Онбординг-план сотрудника</div>
          <div>Сформировано: {new Date().toLocaleDateString('ru-RU')}</div>
          {currentUser && (
            <div>
              Подготовил: {currentUser.lastName} {currentUser.firstName}
            </div>
          )}
        </div>
      </header>

      <section className={classes.employeeCard}>
        <div>
          <div className={classes.employeeName}>{name}</div>
          <div className={classes.employeeMeta}>
            Дата выхода: {new Date(plan.startsAt).toLocaleDateString('ru-RU')}
            {dayInfo && ` · День ${dayInfo.dayNumber}`}
          </div>
        </div>
        <div className={classes.stats}>
          <div>
            <b>
              {progress.completed}/{progress.total}
            </b>{' '}
            задач выполнено
          </div>
          <div>
            <b>{progress.percent}%</b> прогресс плана
          </div>
          {dayInfo && (
            <div>
              <b>{dayInfo.daysLeft}</b> дней до конца испытательного срока
            </div>
          )}
        </div>
      </section>

      {periods.map((period) => {
        const tasks = tasksByPeriod.get(period.name) ?? [];
        const periodProgress = summarizeTasks(tasks);

        return (
          <section key={period.name} className={classes.period}>
            <div className={classes.periodHeader}>
              <span className={classes.periodName}>{period.name}</span>
              <span className={classes.periodMeta}>
                {formatDayRange(period)} · выполнено {periodProgress.completed}/
                {periodProgress.total}
              </span>
            </div>
            <ul className={classes.tasks}>
              {tasks.map((task) => (
                <li key={task.id} className={classes.task}>
                  <span
                    className={
                      task.status === 'completed' ? classes.checkboxDone : classes.checkbox
                    }
                  />
                  <span
                    className={task.status === 'completed' ? classes.taskDone : undefined}
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className={classes.footer}>
        OnboardPro · план онбординга · {new Date().getFullYear()}
      </footer>
    </div>
  );
}, 'PlanPrint');
