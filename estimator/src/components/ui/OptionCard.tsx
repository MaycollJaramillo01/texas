'use client';

interface OptionCardProps {
  value: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
}

export default function OptionCard({
  value,
  label,
  description,
  selected,
  onSelect,
  icon,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'relative flex w-full flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2635] focus-visible:ring-offset-2 cursor-pointer',
        selected
          ? 'border-[#8B2635] bg-red-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm',
      ].join(' ')}
    >
      {icon && <span className="mb-1 text-slate-500">{icon}</span>}
      <span className={`text-sm font-semibold ${selected ? 'text-[#8B2635]' : 'text-slate-900'}`}>
        {label}
      </span>
      {description && (
        <span className="text-xs text-slate-500 leading-snug">{description}</span>
      )}
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B2635]">
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}
