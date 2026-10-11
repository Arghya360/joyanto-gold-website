export interface OpeningHours {
  open: string;
  close: string;
}

export type WeeklyOpeningHours = Partial<Record<number, OpeningHours | null>>;

export const CONTACT_CONFIG = {
  timezone: 'Asia/Dubai',
  phone: null as string | null,
  email: null as string | null,
  whatsapp: null as string | null,
  address: null as string | null,
  mapUrl: null as string | null,
  privacyUrl: null as string | null,
  responseTime: null as string | null,
  openingHours: null as WeeklyOpeningHours | null,
  holidays: [] as readonly string[],
  closedWeekdays: [0, 6] as readonly number[],
  bookingWindowDays: 60,
  slotDurationMinutes: 45,
  mockAppointmentHours: { open: '09:00', close: '17:00' },
  phoneDialCodes: [
    { country: 'United Arab Emirates', code: '+971' },
    { country: 'United Kingdom', code: '+44' },
    { country: 'United States', code: '+1' },
    { country: 'India', code: '+91' },
    { country: 'Saudi Arabia', code: '+966' },
    { country: 'Australia', code: '+61' },
    { country: 'Canada', code: '+1' },
    { country: 'France', code: '+33' },
    { country: 'Germany', code: '+49' },
    { country: 'Japan', code: '+81' },
    { country: 'Pakistan', code: '+92' },
    { country: 'Singapore', code: '+65' },
  ],
  countries: [
    'Australia', 'Bahrain', 'Bangladesh', 'Canada', 'China', 'France', 'Germany',
    'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Jordan', 'Kuwait',
    'Malaysia', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Oman',
    'Pakistan', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Africa',
    'Sri Lanka', 'Switzerland', 'United Arab Emirates', 'United Kingdom',
    'United States',
  ],
} as const;

export function isOpenNow(now: Date, weeklyHours: WeeklyOpeningHours | null): boolean | null {
  if (!weeklyHours) return null;

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CONTACT_CONFIG.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekday = parts.find(part => part.type === 'weekday')?.value;
  const hour = Number(parts.find(part => part.type === 'hour')?.value);
  const minute = Number(parts.find(part => part.type === 'minute')?.value);
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday ?? '');
  const hours = weeklyHours[weekdayIndex];
  if (!hours || !Number.isFinite(hour) || !Number.isFinite(minute)) return false;

  const [openHour, openMinute] = hours.open.split(':').map(Number);
  const [closeHour, closeMinute] = hours.close.split(':').map(Number);
  const currentMinutes = hour * 60 + minute;
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  if (![openMinutes, closeMinutes].every(Number.isFinite) || closeMinutes <= openMinutes) return false;
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}
