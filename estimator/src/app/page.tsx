import EstimatorWizard from '@/components/estimator/EstimatorWizard';
import type { ServiceType } from '@/types/estimate';

const VALID_SERVICES: ServiceType[] = [
  'interior_painting',
  'exterior_painting',
  'cabinet_refinishing',
  'drywall',
  'drywall_repair',
  'lvp_flooring',
  'tile',
  'stain_clear',
];

/**
 * The home-page hero calculator links here with ?service=&qty=. Map that single
 * quantity onto the field its service's form actually reads, so the visitor is
 * never asked for a number they already typed.
 */
function buildInitialDetails(service: ServiceType, qty: number): Record<string, unknown> | undefined {
  if (service === 'cabinet_refinishing') return { cabinetDoors: Math.round(qty) };
  if (service === 'drywall_repair') return undefined; // no quantity to carry
  return { squareFootage: qty };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const rawService = typeof params.service === 'string' ? params.service : undefined;
  const initialService = VALID_SERVICES.includes(rawService as ServiceType)
    ? (rawService as ServiceType)
    : undefined;

  const rawQty = typeof params.qty === 'string' ? Number.parseFloat(params.qty) : Number.NaN;
  const qty = Number.isFinite(rawQty) && rawQty > 0 && rawQty <= 25000 ? rawQty : undefined;
  const initialDetails = initialService && qty ? buildInitialDetails(initialService, qty) : undefined;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <a href="https://texashighrefinished.com" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#8B2635]">
              <span className="text-xs font-bold text-white">THR</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">Texas High Refinished</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8B2635]">
            Free Project Estimator
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Get Your Project Estimate
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
            Answer a few questions and receive an estimated investment range before scheduling your verification visit.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span>Takes ~2 minutes</span>
            <span className="hidden sm:inline">·</span>
            <span>No commitment required</span>
            <span className="hidden sm:inline">·</span>
            <span>Serving Texas Hill Country since 2019</span>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EstimatorWizard initialService={initialService} initialDetails={initialDetails} />
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 pb-8 pt-6">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Texas High Refinished · 314 N Ridge Rd, Marble Falls, TX 78654 ·{' '}
            <a href="tel:+18305963323" className="underline underline-offset-2 hover:text-slate-600">
              (830) 596-3323
            </a>
          </p>
          <p className="mt-1">
            This tool provides preliminary estimates for informational purposes only. Actual pricing is confirmed after an on-site visit.
          </p>
        </div>
      </footer>
    </main>
  );
}
