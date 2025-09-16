import React, { useMemo, useState } from 'react';
import css from './FullCalendar.module.css';

export type FullCalendarEvent = {
  eventType: string;
  eventName: string;
  startsAt: string | Date;
  endsAt: string | Date;
  color?: string;
};

interface FullCalendarProps {
  events: FullCalendarEvent[];
  timeZone?: string; // IANA TZ, e.g., "Europe/Moscow"
  initialDate?: Date; // anchor date (defaults to today)
}

type View = 'month' | 'day';
type DayMode = 'timeline' | 'list';

const DEFAULT_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// Helpers for timezone-aware calculations
function getTZParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month), // 1-12
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTZOffsetMinutes(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  const tzTimeAsUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (tzTimeAsUTC - date.getTime()) / 60000;
}

// Construct a UTC Date that corresponds to given wall time in TZ
function zonedWallTimeToUTC(year: number, monthIndex0: number, day: number, hour: number, minute: number, second: number, timeZone: string) {
  const approxUTC = Date.UTC(year, monthIndex0, day, hour, minute, second);
  const offsetMin = getTZOffsetMinutes(new Date(approxUTC), timeZone);
  return new Date(approxUTC - offsetMin * 60000);
}

function startOfMonthUTC(year: number, monthIndex0: number, timeZone: string) {
  return zonedWallTimeToUTC(year, monthIndex0, 1, 0, 0, 0, timeZone);
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const weekdayHeaders = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']; // Monday-first

export const FullCalendar: React.FC<FullCalendarProps> = ({ events, timeZone = DEFAULT_TZ, initialDate }) => {
  const todayUTC = useMemo(() => new Date(), []);
  const todayParts = getTZParts(todayUTC, timeZone);
  const [view, setView] = useState<View>('month');
  const [dayMode, setDayMode] = useState<DayMode>('timeline');
  const [anchor, setAnchor] = useState<Date>(() => initialDate || startOfMonthUTC(todayParts.year, todayParts.month - 1, timeZone));
  const [selectedDayUTC, setSelectedDayUTC] = useState<Date | null>(null);

  // Derive anchor parts in TZ for header controls
  const anchorParts = getTZParts(anchor, timeZone);

  // Normalize events
  const parsedEvents = useMemo(() => {
    return events.map(e => ({
      ...e,
      startsAt: e.startsAt instanceof Date ? e.startsAt : new Date(e.startsAt),
      endsAt: e.endsAt instanceof Date ? e.endsAt : new Date(e.endsAt),
    }));
  }, [events]);

  // Month grid data
  const monthCells = useMemo(() => {
    const y = anchorParts.year;
    const mIdx = anchorParts.month - 1;
    const firstUTC = startOfMonthUTC(y, mIdx, timeZone);
    const firstParts = getTZParts(firstUTC, timeZone);
    // get day of week Monday-first: JS 0=Sun..6=Sat, we convert to Mon-first 0..6
    const firstDowJS = new Date(firstUTC).getUTCDay();
    const firstDowMonFirst = (firstDowJS + 6) % 7;
    const totalDays = daysInMonth(y, mIdx);
    const cells: { type: 'empty' | 'day'; dayNumber?: number; dateUTC?: Date }[] = [];
    for (let i = 0; i < firstDowMonFirst; i++) cells.push({ type: 'empty' });
    for (let d = 1; d <= totalDays; d++) {
      const dUTC = zonedWallTimeToUTC(y, mIdx, d, 0, 0, 0, timeZone);
      cells.push({ type: 'day', dayNumber: d, dateUTC: dUTC });
    }
    // Pad to full weeks (6 weeks x 7 days = 42 cells)
    while (cells.length % 7 !== 0) cells.push({ type: 'empty' });
    while (cells.length < 42) cells.push({ type: 'empty' });
    return cells;
  }, [anchorParts.year, anchorParts.month, timeZone]);

  const monthViewLabel = `Календарь: Месяц ${monthNames[anchorParts.month - 1]} ${anchorParts.year}`;

  // Day view label
  const dayViewParts = selectedDayUTC ? getTZParts(selectedDayUTC, timeZone) : null;
  const dayViewLabel = selectedDayUTC ?
    `Календарь: День ${String(dayViewParts!.day).padStart(2,'0')} ${monthNames[dayViewParts!.month - 1]} ${dayViewParts!.year}` :
    'Календарь: День';

  // Events for selected day (in TZ)
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDayUTC) return [] as ReturnType<typeof parsedEvents.slice>;
    const p = getTZParts(selectedDayUTC, timeZone);
    return parsedEvents.filter(e => {
      const sp = getTZParts(e.startsAt as Date, timeZone);
      const ep = getTZParts(e.endsAt as Date, timeZone);
      // Event intersects the day if it starts or ends on that date, or spans across it
      const eventStartDay = Date.UTC(sp.year, sp.month - 1, sp.day);
      const eventEndDay = Date.UTC(ep.year, ep.month - 1, ep.day);
      const targetDay = Date.UTC(p.year, p.month - 1, p.day);
      return targetDay >= eventStartDay && targetDay <= eventEndDay;
    }).sort((a, b) => (a.startsAt as Date).getTime() - (b.startsAt as Date).getTime());
  }, [selectedDayUTC, parsedEvents, timeZone]);

  // Build per-hour segments and dynamic heights for timeline view
  const ROW_HEIGHT = 28; // px per event row
  const ROW_GAP = 6; // px
  const H_PADDING = 12; // vertical padding sum per hour block
  const hourSegments = useMemo(() => {
    if (!selectedDayUTC) return Array.from({ length: 24 }, () => [] as any[]);
    const p = getTZParts(selectedDayUTC, timeZone);
    const segments: { startMin: number; durMin: number; e: any }[][] = Array.from({ length: 24 }, () => []);
    for (const e of eventsForSelectedDay) {
      const sp = getTZParts(e.startsAt as Date, timeZone);
      const ep = getTZParts(e.endsAt as Date, timeZone);
      const dayStartMin = (sp.year === p.year && sp.month === p.month && sp.day === p.day) ? sp.hour * 60 + sp.minute : 0;
      const dayEndMin = (ep.year === p.year && ep.month === p.month && ep.day === p.day) ? ep.hour * 60 + ep.minute : 24 * 60;
      const start = Math.max(0, Math.min(1440, dayStartMin));
      const end = Math.max(0, Math.min(1440, dayEndMin));
      if (end <= start) continue;
      for (let h = Math.floor(start / 60); h <= Math.floor((end - 1) / 60); h++) {
        const hourStart = h * 60;
        const hourEnd = (h + 1) * 60;
        const segStart = Math.max(start, hourStart);
        const segEnd = Math.min(end, hourEnd);
        if (segEnd > segStart) {
          segments[h].push({ startMin: segStart - hourStart, durMin: segEnd - segStart, e });
        }
      }
    }
    return segments;
  }, [eventsForSelectedDay, selectedDayUTC, timeZone]);

  const hourHeights = useMemo(() => {
    return hourSegments.map(segs => {
      const rows = Math.max(1, segs.length);
      return rows * ROW_HEIGHT + (rows - 1) * ROW_GAP + H_PADDING;
    });
  }, [hourSegments]);

  function goToPrevMonth() {
    const y = anchorParts.year;
    const mIdx = anchorParts.month - 1;
    const prev = mIdx === 0 ? { y: y - 1, m: 11 } : { y, m: mIdx - 1 };
    setAnchor(startOfMonthUTC(prev.y, prev.m, timeZone));
  }
  function goToNextMonth() {
    const y = anchorParts.year;
    const mIdx = anchorParts.month - 1;
    const next = mIdx === 11 ? { y: y + 1, m: 0 } : { y, m: mIdx + 1 };
    setAnchor(startOfMonthUTC(next.y, next.m, timeZone));
  }
  function goToToday() {
    setAnchor(startOfMonthUTC(todayParts.year, todayParts.month - 1, timeZone));
    setSelectedDayUTC(zonedWallTimeToUTC(todayParts.year, todayParts.month - 1, todayParts.day, 0, 0, 0, timeZone));
  }

  function onMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMonthIdx = Number(e.target.value);
    setAnchor(startOfMonthUTC(anchorParts.year, newMonthIdx, timeZone));
  }
  function onYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newYear = Number(e.target.value);
    setAnchor(startOfMonthUTC(newYear, anchorParts.month - 1, timeZone));
  }

  function openDay(dateUTC: Date) {
    setSelectedDayUTC(dateUTC);
    setView('day');
  }

  return (
    <div className={css.calendarWrapper}>
      <div className={css.calendarHeader}>
        <div className={css.headerTitle}>
          {view === 'month' ? monthViewLabel : dayViewLabel}
          <span className={css.headerTz}>Часовой пояс: {timeZone}</span>
        </div>
        <div className={css.headerControls}>
          <button className={css.ghostBtn} onClick={goToPrevMonth}>&lt;</button>
          <select className={css.select} value={anchorParts.month - 1} onChange={onMonthChange}>
            {monthNames.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select className={css.select} value={anchorParts.year} onChange={onYearChange}>
            {Array.from({ length: 11 }, (_, i) => anchorParts.year - 5 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className={css.ghostBtn} onClick={goToNextMonth}>&gt;</button>
          <button className={css.primaryBtn} onClick={goToToday}>Сегодня</button>
          <div className={css.viewSwitch}>
            <button className={`${css.switchBtn} ${view === 'month' ? css.active : ''}`} onClick={() => setView('month')}>Месяц</button>
            <button className={`${css.switchBtn} ${view === 'day' ? css.active : ''}`} onClick={() => selectedDayUTC && setView('day')} disabled={!selectedDayUTC}>День</button>
          </div>
        </div>
      </div>

      {view === 'month' && (
        <div className={css.monthView}>
          <div className={css.weekdaysRow}>
            {weekdayHeaders.map(w => (
              <div key={w} className={css.weekday}>{w}</div>
            ))}
          </div>
          <div className={css.monthGrid}>
            {monthCells.map((cell, idx) => {
              if (cell.type === 'empty') return <div key={idx} className={css.emptyCell} />;
              const parts = getTZParts(cell.dateUTC!, timeZone);
              const isToday = parts.year === todayParts.year && parts.month === todayParts.month && parts.day === todayParts.day;
              const dayEvents = parsedEvents.filter(e => {
                const sp = getTZParts(e.startsAt as Date, timeZone);
                const ep = getTZParts(e.endsAt as Date, timeZone);
                const dayStamp = Date.UTC(parts.year, parts.month - 1, parts.day);
                const startStamp = Date.UTC(sp.year, sp.month - 1, sp.day);
                const endStamp = Date.UTC(ep.year, ep.month - 1, ep.day);
                return dayStamp >= startStamp && dayStamp <= endStamp;
              });
              return (
                <button key={idx} className={`${css.dayCell} ${isToday ? css.today : ''}`} onClick={() => openDay(cell.dateUTC!)}>
                  <div className={css.dayNumber}>{cell.dayNumber}</div>
                  <div className={css.eventDots}>
                    {dayEvents.slice(0, 4).map((e, i) => (
                      <span key={i} className={css.eventDot} style={{ background: e.color || 'var(--accent-primary)' }} title={e.eventName} />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className={css.moreBadge}>+{dayEvents.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'day' && selectedDayUTC && (
        <div className={css.dayView}>
          <div className={css.dayToolbar}>
            <div className={css.dayInfo}>{dayViewLabel}</div>
            <div className={css.daySwitch}>
              <button className={`${css.switchBtn} ${dayMode === 'timeline' ? css.active : ''}`} onClick={() => setDayMode('timeline')}>Таймлайн</button>
              <button className={`${css.switchBtn} ${dayMode === 'list' ? css.active : ''}`} onClick={() => setDayMode('list')}>Список</button>
            </div>
          </div>

          {dayMode === 'timeline' ? (
            <div className={css.timeline}>
              <div className={css.hours}>
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className={css.hourLabel} style={{ height: `${hourHeights[h]}px` }}>{String(h).padStart(2,'0')}:00</div>
                ))}
              </div>
              <div className={css.timelineCanvas}>
                {hourSegments.map((segs, h) => {
                  const rows = Math.max(1, segs.length);
                  return (
                    <div key={h} className={css.hourBlock} style={{ height: `${hourHeights[h]}px` }}>
                      <div className={css.hourRows} style={{ gap: `${ROW_GAP}px` }}>
                        {Array.from({ length: rows }).map((_, r) => {
                          const seg = segs[r];
                          return (
                            <div key={r} className={css.hourEventRow}>
                              {seg && (
                                <div
                                  className={css.hourEventBar}
                                  style={{
                                    left: `${(seg.startMin / 60) * 100}%`,
                                    width: `${(seg.durMin / 60) * 100}%`,
                                    background: seg.e.color || 'var(--accent-primary)'
                                  }}
                                >
                                  <div className={css.eventTitle}>{seg.e.eventName}</div>
                                  <div className={css.eventTime}>
                                    {`${String(Math.floor((seg.startMin + h*60)/60)).padStart(2,'0')}:${String((seg.startMin + h*60)%60).padStart(2,'0')} – ${String(Math.floor((seg.startMin + seg.durMin + h*60)/60)).padStart(2,'0')}:${String((seg.startMin + seg.durMin + h*60)%60).padStart(2,'0')}`}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={css.dayList}>
              {eventsForSelectedDay.length === 0 && (
                <div className={css.emptyDay}>Событий нет</div>
              )}
              {eventsForSelectedDay.map((e, idx) => {
                const sp = getTZParts(e.startsAt as Date, timeZone);
                const ep = getTZParts(e.endsAt as Date, timeZone);
                return (
                  <div key={idx} className={css.listItem}>
                    <div className={css.listTime}>
                      {String(sp.hour).padStart(2,'0')}:{String(sp.minute).padStart(2,'0')} – {String(ep.hour).padStart(2,'0')}:{String(ep.minute).padStart(2,'0')}
                    </div>
                    <div className={css.listBody}>
                      <div className={css.listTitle}>{e.eventName}</div>
                      <div className={css.listType}>{e.eventType}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FullCalendar;
