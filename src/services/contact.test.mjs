import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTACT_CONFIG, isOpenNow } from '../config/contact.ts';
import {
  appointmentService,
  createAppointmentIcs,
  getDubaiDate,
  isAppointmentDateDisabled,
  parseContactType,
  validateContactEnquiry,
} from './contact.ts';

const validEnquiry = {
  name: 'Alex Example',
  email: 'alex@example.com',
  phone: '+971501234567',
  country: 'United Arab Emirates',
  type: 'Buying',
  preferredContact: 'Email',
  bestTime: 'Morning',
  message: 'I would like to learn more about buying gold.',
  consent: true,
};

test('contact enquiry validation accepts a complete enquiry', () => {
  assert.deepEqual(validateContactEnquiry(validEnquiry), {});
});

test('contact enquiry validation reports invalid fields and the honeypot', () => {
  const invalid = validateContactEnquiry({
    ...validEnquiry,
    name: ' ',
    email: 'not-an-email',
    phone: '1234',
    type: 'Unknown',
    preferredContact: 'Post',
    message: 'short',
    consent: false,
  }, 'bot filled this');

  assert.deepEqual(invalid, {
    name: 'required',
    email: 'email',
    phone: 'phone',
    type: 'type',
    preferredContact: 'contact',
    message: 'message',
    consent: 'consent',
    honeypot: 'honeypot',
  });
});

test('contact type query values normalize supported labels and aliases', () => {
  assert.equal(parseContactType('private_consultation'), 'Private Assets');
  assert.equal(parseContactType('MC Reserve'), 'MC Reserve');
  assert.equal(parseContactType('BUYING'), 'Buying');
  assert.equal(parseContactType('unknown'), null);
  assert.equal(parseContactType(null), null);
});

test('Dubai date conversion and opening-hour boundaries use Asia/Dubai time', () => {
  assert.equal(getDubaiDate(new Date('2026-01-01T20:30:00Z')), '2026-01-02');
  const mondayHours = { 1: { open: '09:00', close: '17:00' } };
  assert.equal(isOpenNow(new Date('2026-05-04T04:59:00Z'), mondayHours), false);
  assert.equal(isOpenNow(new Date('2026-05-04T05:00:00Z'), mondayHours), true);
  assert.equal(isOpenNow(new Date('2026-05-04T13:00:00Z'), mondayHours), false);
  assert.equal(isOpenNow(new Date('2026-05-04T05:00:00Z'), null), null);
});

test('appointment dates enforce past, weekend and booking-window limits', () => {
  assert.equal(isAppointmentDateDisabled('2026-04-30', '2026-05-01'), true);
  assert.equal(isAppointmentDateDisabled('2026-05-01', '2026-05-01'), false);
  assert.equal(isAppointmentDateDisabled('2026-05-02', '2026-05-01'), true);
  assert.equal(isAppointmentDateDisabled('2026-07-01', '2026-05-01'), true);
  assert.equal(isAppointmentDateDisabled('not-a-date', '2026-05-01'), true);
});

test('mock slots use configured duration and hide closed or ineligible dates', () => {
  const now = new Date('2026-05-01T05:00:00Z');
  const slots = appointmentService.getSlots('2026-05-04', [], now);
  assert.equal(slots.length, Math.floor(
    ((17 - 9) * 60) / CONTACT_CONFIG.slotDurationMinutes,
  ));
  assert.equal(slots[0].time, '09:00');
  assert.equal(appointmentService.getSlots('2026-05-02', [], now).length, 0);
  assert.equal(appointmentService.getSlots('2026-04-30', [], now).length, 0);
  assert.equal(appointmentService.getSlots('2026-07-01', [], now).length, 0);
  assert.equal(appointmentService.getSlots('2026-05-04', ['2026-05-04T09:00'], now)
    .find(slot => slot.time === '09:00').available, false);
});

test('demo appointment reservations persist for the current browser session', () => {
  const previousStorage = globalThis.sessionStorage;
  const values = new Map();
  globalThis.sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };

  try {
    const date = new Date(`${getDubaiDate()}T12:00:00Z`);
    let dateString = '';
    let availableSlot;
    for (let daysAhead = 1; daysAhead <= 7 && !availableSlot; daysAhead += 1) {
      const candidate = new Date(date);
      candidate.setUTCDate(candidate.getUTCDate() + daysAhead);
      dateString = candidate.toISOString().slice(0, 10);
      availableSlot = appointmentService.getSlots(dateString).find(slot => slot.available);
    }
    assert.ok(availableSlot);

    assert.equal(appointmentService.reserveSlot(dateString, availableSlot.time), true);
    assert.deepEqual(appointmentService.getReservedSlots(), [`${dateString}T${availableSlot.time}`]);
    assert.equal(appointmentService.reserveSlot(dateString, availableSlot.time), false);
    appointmentService.releaseSlot(dateString, availableSlot.time);
    assert.deepEqual(appointmentService.getReservedSlots(), []);
  } finally {
    if (previousStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = previousStorage;
  }
});

test('appointment calendar export includes the Dubai meeting window and escaped copy', () => {
  const calendar = createAppointmentIcs('AP-TEST', '2026-05-04', '09:00', 'Buying, storage');
  assert.match(calendar, /BEGIN:VCALENDAR/);
  assert.match(calendar, /DTSTART;TZID=Asia\/Dubai:20260504T090000/);
  assert.match(calendar, /DTEND;TZID=Asia\/Dubai:20260504T094500/);
  assert.match(calendar, /SUMMARY:Private meeting request · Buying\\, storage/);
  assert.match(calendar, /DESCRIPTION:This meeting request is subject to confirmation\./);
});

test('mock enquiry receipt has a demo reference and timestamp', async () => {
  const receipt = await (await import('./contact.ts')).contactService.submitEnquiry(validEnquiry, 0);
  assert.match(receipt.reference, /^CT-\d{8}-\d{4}$/);
  assert.ok(Number.isFinite(receipt.receivedAt));
});
