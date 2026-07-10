export const BOOKING_TIMEZONE = 'America/Chicago';
export const BOOKING_HOURS_LABEL = 'Monday-Friday, 10:00 AM-4:00 PM Texas time';

const BOOKING_START_MINUTES = 10 * 60;
const BOOKING_END_MINUTES = 16 * 60;
const BOOKING_WEEKDAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

export function isAllowedVerificationSlot(slotIso: string): boolean {
  const date = new Date(slotIso);
  if (!Number.isFinite(date.getTime())) return false;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOOKING_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const weekday = get('weekday');
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  if (!weekday || !Number.isFinite(hour) || !Number.isFinite(minute)) return false;

  const localMinutes = hour * 60 + minute;
  return (
    BOOKING_WEEKDAYS.has(weekday) &&
    localMinutes >= BOOKING_START_MINUTES &&
    localMinutes <= BOOKING_END_MINUTES
  );
}
