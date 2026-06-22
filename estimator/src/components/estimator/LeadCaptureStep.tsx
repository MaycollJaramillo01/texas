'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import type { WizardData } from '@/types/estimate';

interface Props {
  value: WizardData['lead'];
  onChange: (data: WizardData['lead'], isValid: boolean) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(d: WizardData['lead']) {
  return (
    d.name.trim().length >= 2 &&
    EMAIL_RE.test(d.email) &&
    d.phone.trim().length >= 7 &&
    d.city.trim().length >= 2
  );
}

export default function LeadCaptureStep({ value, onChange }: Props) {
  const [fields, setFields] = useState(value);
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, city: false });

  useEffect(() => {
    onChange(fields, validate(fields));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const set = (k: keyof WizardData['lead']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [k]: e.target.value }));
  };
  const touch = (k: keyof typeof touched) => () => setTouched((prev) => ({ ...prev, [k]: true }));

  const errors = {
    name: touched.name && fields.name.trim().length < 2 ? 'Please enter your full name.' : undefined,
    email: touched.email && !EMAIL_RE.test(fields.email) ? 'Please enter a valid email address.' : undefined,
    phone: touched.phone && fields.phone.trim().length < 7 ? 'Please enter a valid phone number.' : undefined,
    city: touched.city && fields.city.trim().length < 2 ? 'Please enter your city.' : undefined,
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Where should we send your estimate?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your information is kept private and used only to send your estimate and schedule your visit.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Esdras Paz"
          value={fields.name}
          onChange={set('name')}
          onBlur={touch('name')}
          error={errors.name}
          required
          autoComplete="name"
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={set('email')}
          onBlur={touch('email')}
          error={errors.email}
          required
          autoComplete="email"
        />
        <Input
          label="Phone number"
          type="tel"
          placeholder="(830) 596-3323"
          value={fields.phone}
          onChange={set('phone')}
          onBlur={touch('phone')}
          error={errors.phone}
          required
          autoComplete="tel"
        />
        <Input
          label="City"
          type="text"
          placeholder="Marble Falls, TX"
          value={fields.city}
          onChange={set('city')}
          onBlur={touch('city')}
          error={errors.city}
          required
          autoComplete="address-level2"
        />
      </div>
      <p className="text-xs text-slate-400">
        By submitting, you agree to be contacted by Texas High Refinished regarding your project estimate.
      </p>
    </div>
  );
}
