'use client';

import OptionCard from '@/components/ui/OptionCard';
import type { CustomerType } from '@/types/estimate';

interface Props {
  value: CustomerType | null;
  onChange: (v: CustomerType) => void;
}

const options: { value: CustomerType; label: string; description: string }[] = [
  {
    value: 'homeowner',
    label: 'Homeowner',
    description: 'You own the property and are looking to renovate or update your home.',
  },
  {
    value: 'builder',
    label: 'Builder / Contractor',
    description: 'You are a professional builder or contractor with recurring project needs.',
  },
  {
    value: 'property_manager',
    label: 'Property Manager',
    description: 'You manage rental properties or a portfolio of residential units.',
  },
];

export default function CustomerTypeStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Who is this project for?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select the option that best describes you. This helps us provide the most accurate estimate.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            label={opt.label}
            description={opt.description}
            selected={value === opt.value}
            onSelect={(v) => onChange(v as CustomerType)}
          />
        ))}
      </div>
    </div>
  );
}
