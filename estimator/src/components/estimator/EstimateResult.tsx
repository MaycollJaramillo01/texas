'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { BOOKING_HOURS_LABEL } from '@/lib/booking-policy';
import type { EstimateRange, ServiceType, WizardData } from '@/types/estimate';

interface Props {
  estimate: EstimateRange;
  service: ServiceType;
  lead: WizardData['lead'];
  message?: string;
  onStartOver: () => void;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  interior_painting: 'Interior Painting',
  exterior_painting: 'Exterior Painting',
  cabinet_refinishing: 'Cabinet Refinishing',
  drywall: 'Drywall',
  drywall_repair: 'Drywall Repair',
  lvp_flooring: 'Luxury Vinyl Plank (LVP)',
  tile: 'Tile Installation',
  stain_clear: 'Stain & Clear',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtDay(date: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(`${date}T12:00:00`));
}

function fmtTime(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(
    new Date(iso)
  );
}

type BookingState = 'idle' | 'loading' | 'choosing' | 'submitting' | 'booked' | 'error';

export default function EstimateResult({ estimate, service, lead, message, onStartOver }: Props) {
  const [booking, setBooking] = useState<BookingState>('idle');
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [timezone, setTimezone] = useState('America/Chicago');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  async function loadSlots() {
    setBooking('loading');
    setBookingError(null);
    try {
      const res = await fetch('/api/appointments');
      const json = await res.json();
      if (!json.success || Object.keys(json.slots ?? {}).length === 0) {
        setBookingError(json.error ?? 'No times available right now. Please call us to schedule.');
        setBooking('error');
        return;
      }
      setSlots(json.slots);
      setTimezone(json.timezone ?? 'America/Chicago');
      setSelectedDay(Object.keys(json.slots)[0]);
      setBooking('choosing');
    } catch {
      setBookingError('Could not load available times. Please call us to schedule.');
      setBooking('error');
    }
  }

  async function confirmBooking() {
    if (!selectedSlot) return;
    setBooking('submitting');
    setBookingError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          startTime: selectedSlot,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setBookingError(json.error ?? 'Something went wrong. Please try again.');
        setBooking('choosing');
        return;
      }
      setBooking('booked');
    } catch {
      setBookingError('Network error. Please try again.');
      setBooking('choosing');
    }
  }

  const days = Object.keys(slots);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.97 5.03a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          Estimate Ready
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Estimated Investment</h2>
        <p className="mt-1 text-sm text-slate-500">Service: {SERVICE_LABELS[service]}</p>
      </div>

      {/* Inspection banner */}
      {estimate.inspectionRecommended && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">On-site inspection strongly recommended</p>
          <p className="mt-1 text-xs text-amber-700">
            The range below is a preliminary estimate. Large or complex repairs vary significantly — a verification visit ensures accurate pricing.
          </p>
        </div>
      )}

      {/* Range cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Low Range</p>
          <p className="text-2xl font-bold text-slate-800 sm:text-3xl">{fmt(estimate.low)}</p>
          <p className="mt-1 text-xs text-slate-400">Favorable conditions</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border-2 border-[#8B2635] bg-red-50 p-4 text-center shadow-md">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B2635]">Typical Project</p>
          <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{fmt(estimate.typical)}</p>
          <p className="mt-1 text-xs text-slate-500">Most common outcome</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Premium</p>
          <p className="text-2xl font-bold text-slate-800 sm:text-3xl">{fmt(estimate.premium)}</p>
          <p className="mt-1 text-xs text-slate-400">Complex conditions</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          {message ??
            'This estimate is based on the information provided and is for informational purposes only. Final pricing will be confirmed after an on-site project verification.'}
        </p>
      </div>

      {/* Scheduling */}
      {booking === 'booked' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center" role="status">
          <p className="text-base font-bold text-green-800">Visit scheduled ✓</p>
          <p className="mt-1 text-sm text-green-700">
            {selectedDay && selectedSlot && (
              <>
                {fmtDay(selectedDay, timezone)} at {fmtTime(selectedSlot, timezone)} (Texas time)
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-green-700">
            You&apos;ll receive a confirmation shortly. We look forward to seeing your project!
          </p>
        </div>
      ) : booking === 'choosing' || booking === 'submitting' ? (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Pick a day and time for your free verification visit</p>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedSlot(null);
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  selectedDay === day
                    ? 'border-[#8B2635] bg-red-50 text-[#8B2635]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {fmtDay(day, timezone)}
              </button>
            ))}
          </div>
          {selectedDay && (
            <div className="flex flex-wrap gap-2">
              {(slots[selectedDay] ?? []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    selectedSlot === slot
                      ? 'border-[#8B2635] bg-[#8B2635] text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {fmtTime(slot, timezone)}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400">Available {BOOKING_HOURS_LABEL}.</p>
          {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
          <Button
            variant="primary"
            size="lg"
            onClick={confirmBooking}
            disabled={!selectedSlot}
            loading={booking === 'submitting'}
            className="w-full"
          >
            Confirm Visit
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={loadSlots}
            disabled={booking === 'loading'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B2635] px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-150 hover:bg-[#7a2030] hover:shadow-lg disabled:opacity-70"
          >
            {booking === 'loading' ? 'Loading available times…' : 'Schedule Verification Visit'}
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {booking === 'error' && bookingError && (
            <p className="text-center text-sm text-red-600">{bookingError}</p>
          )}
        </div>
      )}

      <Button variant="ghost" size="md" onClick={onStartOver} className="w-full">
        Start a new estimate
      </Button>

      {/* Contact */}
      <div className="border-t border-slate-200 pt-4 text-center">
        <p className="text-xs text-slate-500">
          Questions? Call us at{' '}
          <a href="tel:+18305963323" className="font-medium text-slate-700 underline underline-offset-2">
            (830) 596-3323
          </a>{' '}
          — Marble Falls, TX
        </p>
      </div>
    </div>
  );
}
