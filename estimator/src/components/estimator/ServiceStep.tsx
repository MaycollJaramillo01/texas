'use client';

import OptionCard from '@/components/ui/OptionCard';
import type { ServiceType } from '@/types/estimate';

interface Props {
  value: ServiceType | null;
  onChange: (v: ServiceType) => void;
}

const services: { value: ServiceType; label: string; description: string }[] = [
  { value: 'interior_painting', label: 'Interior Painting', description: 'Walls, ceilings, trim, and interior doors.' },
  { value: 'exterior_painting', label: 'Exterior Painting', description: 'Siding, stucco, brick, fences, and decks.' },
  { value: 'cabinet_refinishing', label: 'Cabinet Refinishing', description: 'Kitchen, bathroom, and custom cabinet doors.' },
  { value: 'drywall', label: 'Drywall', description: 'New installation, tape & float, and texture finishes.' },
  { value: 'drywall_repair', label: 'Drywall Repair', description: 'Patch and repair holes, cracks, or water damage.' },
  { value: 'lvp_flooring', label: 'Luxury Vinyl Plank (LVP)', description: 'Durable plank flooring installation for residential interiors.' },
  { value: 'tile', label: 'Tile Installation', description: 'Floors, showers, backsplash, and full shower remodels.' },
  { value: 'stain_clear', label: 'Stain & Clear', description: 'Interior/exterior wood staining and clear coat finishes.' },
];

export default function ServiceStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">What service do you need?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select the primary service for your project. You can request multiple services after your visit.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((svc) => (
          <OptionCard
            key={svc.value}
            value={svc.value}
            label={svc.label}
            description={svc.description}
            selected={value === svc.value}
            onSelect={(v) => onChange(v as ServiceType)}
          />
        ))}
      </div>
    </div>
  );
}
