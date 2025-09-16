import type { FC } from 'react';
import css from './TeamCallendar.module.css';
import FullCalendar, { type FullCalendarEvent } from '../../../../shared/components/FullCalendar/FullCalendar';

interface IProps {}

const TeamCallendar: FC<IProps> = () => {
  // Demo: events prop can be replaced with real data
  // Create a fixed day with mixed events, including overlaps and partial hours
  const base = new Date();
  const anchor = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0);
  const make = (h: number, m: number, durMin: number) => ({
    start: new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), h, m, 0),
    end: new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), h, m + durMin, 0)
  });

  const demoEvents: FullCalendarEvent[] = [
    // Overlapping morning meetings
    (() => { const { start, end } = make(9, 0, 45); return { eventType: 'meeting', eventName: 'Стендап', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #34d399, #059669)' }; })(),
    (() => { const { start, end } = make(9, 15, 30); return { eventType: 'meeting', eventName: 'Синхрон по фиче', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #f59e0b, #d97706)' }; })(),
    // Partial-hour task
    (() => { const { start, end } = make(10, 30, 20); return { eventType: 'task', eventName: 'Код-ревью', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #60a5fa, #2563eb)' }; })(),
    // Long event spanning hours
    (() => { const { start, end } = make(11, 0, 120); return { eventType: 'workshop', eventName: 'Воркшоп UI', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }; })(),
    // Same-time overlap in afternoon
    (() => { const { start, end } = make(14, 0, 60); return { eventType: 'call', eventName: 'Звонок с клиентом', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #ef4444, #b91c1c)' }; })(),
    (() => { const { start, end } = make(14, 0, 30); return { eventType: 'internal', eventName: '1:1', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #10b981, #047857)' }; })(),
    // Evening quick task
    (() => { const { start, end } = make(17, 45, 15); return { eventType: 'task', eventName: 'Отправить отчёт', startsAt: start, endsAt: end, color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }; })(),
  ];

  return (
    <div className={css.wrapper}>
      <FullCalendar events={demoEvents} timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone} />
    </div>
  );
};

export default TeamCallendar;
