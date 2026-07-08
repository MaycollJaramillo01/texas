'use client';

import { useState, useEffect, useCallback } from 'react';
import Input from '@/components/ui/Input';
import OptionCard from '@/components/ui/OptionCard';
import type {
  ServiceType,
  InteriorPaintingDetails,
  ExteriorPaintingDetails,
  CabinetRefinishingDetails,
  DrywallDetails,
  DrywallRepairDetails,
  TileDetails,
  StainClearDetails,
} from '@/types/estimate';

interface Props {
  service: ServiceType;
  defaultValues: Record<string, unknown>;
  onChange: (data: Record<string, unknown>, isValid: boolean) => void;
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function num(v: unknown): string {
  if (v === undefined || v === null || v === '') return '';
  return String(v);
}

function parseN(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function SelectButtons<T extends string>({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: { value: T; label: string; description?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  cols?: 2 | 3 | 4 | 5;
}) {
  const gridCols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5' }[cols];
  return (
    <div className={`grid grid-cols-2 gap-2 ${gridCols}`}>
      {options.map((o) => (
        <OptionCard
          key={o.value}
          value={o.value}
          label={o.label}
          description={o.description}
          selected={value === o.value}
          onSelect={(v) => onChange(v as T)}
        />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {children}
    </div>
  );
}

// ─── Interior Painting ───────────────────────────────────────────────────────

function InteriorForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [sqft, setSqft] = useState(num(defaults.squareFootage));
  const [condition, setCondition] = useState<InteriorPaintingDetails['condition'] | null>(
    (defaults.condition as InteriorPaintingDetails['condition']) ?? 'vacant'
  );
  const [ceilings, setCeilings] = useState<boolean>((defaults.includeCeilings as boolean) ?? false);
  const [trim, setTrim] = useState<boolean>((defaults.includeTrim as boolean) ?? false);
  const [trimLf, setTrimLf] = useState(num(defaults.trimLinearFeet));
  const [doors, setDoors] = useState(num(defaults.interiorDoors ?? 0));
  const [height, setHeight] = useState<InteriorPaintingDetails['ceilingHeight'] | null>(
    (defaults.ceilingHeight as InteriorPaintingDetails['ceilingHeight']) ?? '8ft'
  );
  const [rush, setRush] = useState<boolean>((defaults.rushProject as boolean) ?? false);

  const emit = useCallback(() => {
    const data: Record<string, unknown> = {
      squareFootage: parseN(sqft),
      condition,
      includeCeilings: ceilings,
      includeTrim: trim,
      trimLinearFeet: parseN(trimLf),
      interiorDoors: Math.round(parseN(doors)),
      ceilingHeight: height,
      rushProject: rush,
    };
    const isValid = parseN(sqft) > 0 && condition !== null && height !== null;
    onChange(data, isValid);
  }, [sqft, condition, ceilings, trim, trimLf, doors, height, rush, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Area to paint (sq ft)"
        type="number"
        min={1}
        placeholder="e.g. 2000"
        value={sqft}
        onChange={(e) => setSqft(e.target.value)}
        unit="sq ft"
        required
      />
      <Field label="Is the house vacant or occupied?">
        <SelectButtons
          options={[{ value: 'vacant', label: 'Vacant' }, { value: 'occupied', label: 'Occupied' }]}
          value={condition}
          onChange={setCondition}
        />
      </Field>
      <Field label="Include ceiling painting?">
        <SelectButtons
          options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
          value={String(ceilings)}
          onChange={(v) => setCeilings(v === 'true')}
        />
      </Field>
      <Field label="Include trim / molding?">
        <SelectButtons
          options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
          value={String(trim)}
          onChange={(v) => setTrim(v === 'true')}
        />
      </Field>
      {trim && (
        <Input
          label="Trim linear footage"
          type="number"
          min={1}
          placeholder="e.g. 350"
          value={trimLf}
          onChange={(e) => setTrimLf(e.target.value)}
          unit="lin ft"
        />
      )}
      <Input
        label="Number of interior doors to paint"
        type="number"
        min={0}
        placeholder="0"
        value={doors}
        onChange={(e) => setDoors(e.target.value)}
        hint="Leave 0 if none."
      />
      <Field label="Ceiling height">
        <SelectButtons
          options={[
            { value: '8ft', label: '8 ft' },
            { value: '9ft', label: '9 ft' },
            { value: '10ft_plus', label: '10 ft +' },
          ]}
          value={height}
          onChange={setHeight}
          cols={3}
        />
      </Field>
      <Field label="Is this a rush project?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes — rush' }]}
          value={String(rush)}
          onChange={(v) => setRush(v === 'true')}
        />
      </Field>
    </div>
  );
}

// ─── Exterior Painting ────────────────────────────────────────────────────────

function ExteriorForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [sqft, setSqft] = useState(num(defaults.squareFootage));
  const [surface, setSurface] = useState<ExteriorPaintingDetails['surfaceType'] | null>(
    (defaults.surfaceType as ExteriorPaintingDetails['surfaceType']) ?? 'standard'
  );
  const [deck, setDeck] = useState<boolean>((defaults.includeDeck as boolean) ?? false);
  const [deckSqft, setDeckSqft] = useState(num(defaults.deckSquareFootage));
  const [fence, setFence] = useState<boolean>((defaults.includeFence as boolean) ?? false);
  const [fenceLf, setFenceLf] = useState(num(defaults.fenceLinearFeet));
  const [access, setAccess] = useState<ExteriorPaintingDetails['access'] | null>(
    (defaults.access as ExteriorPaintingDetails['access']) ?? 'normal'
  );
  const [scraping, setScraping] = useState<boolean>((defaults.heavyScraping as boolean) ?? false);
  const [colorChange, setColorChange] = useState<boolean>((defaults.strongColorChange as boolean) ?? false);
  const [recaulk, setRecaulk] = useState<boolean>((defaults.extensiveRecaulking as boolean) ?? false);

  const emit = useCallback(() => {
    const data: Record<string, unknown> = {
      squareFootage: parseN(sqft),
      surfaceType: surface,
      includeDeck: deck,
      deckSquareFootage: parseN(deckSqft),
      includeFence: fence,
      fenceLinearFeet: parseN(fenceLf),
      access,
      heavyScraping: scraping,
      strongColorChange: colorChange,
      extensiveRecaulking: recaulk,
    };
    const isValid = parseN(sqft) > 0 && surface !== null && access !== null;
    onChange(data, isValid);
  }, [sqft, surface, deck, deckSqft, fence, fenceLf, access, scraping, colorChange, recaulk, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Exterior area (sq ft)"
        type="number"
        min={1}
        placeholder="e.g. 2500"
        value={sqft}
        onChange={(e) => setSqft(e.target.value)}
        unit="sq ft"
        required
      />
      <Field label="Primary surface type">
        <SelectButtons
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'hardie', label: 'Hardie' },
            { value: 'stucco', label: 'Stucco' },
            { value: 'brick', label: 'Brick' },
          ]}
          value={surface}
          onChange={setSurface}
          cols={4}
        />
      </Field>
      <Field label="Include deck staining?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(deck)}
          onChange={(v) => setDeck(v === 'true')}
        />
      </Field>
      {deck && (
        <Input
          label="Deck area (sq ft)"
          type="number"
          min={1}
          placeholder="e.g. 400"
          value={deckSqft}
          onChange={(e) => setDeckSqft(e.target.value)}
          unit="sq ft"
        />
      )}
      <Field label="Include fence staining?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(fence)}
          onChange={(v) => setFence(v === 'true')}
        />
      </Field>
      {fence && (
        <Input
          label="Fence length (linear ft)"
          type="number"
          min={1}
          placeholder="e.g. 200"
          value={fenceLf}
          onChange={(e) => setFenceLf(e.target.value)}
          unit="lin ft"
        />
      )}
      <Field label="Property access">
        <SelectButtons
          options={[{ value: 'normal', label: 'Single story' }, { value: 'two_stories', label: 'Two stories' }]}
          value={access}
          onChange={setAccess}
        />
      </Field>
      <Field label="Requires heavy scraping or prep?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(scraping)}
          onChange={(v) => setScraping(v === 'true')}
        />
      </Field>
      <Field label="Strong color change (e.g. dark to light)?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(colorChange)}
          onChange={(v) => setColorChange(v === 'true')}
        />
      </Field>
      <Field label="Extensive recaulking needed?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(recaulk)}
          onChange={(v) => setRecaulk(v === 'true')}
        />
      </Field>
    </div>
  );
}

// ─── Cabinet Refinishing ──────────────────────────────────────────────────────

function CabinetForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [doors, setDoors] = useState(num(defaults.cabinetDoors));
  const [drawers, setDrawers] = useState(num(defaults.drawerFronts ?? 0));
  const [finish, setFinish] = useState<CabinetRefinishingDetails['finishLevel'] | null>(
    (defaults.finishLevel as CabinetRefinishingDetails['finishLevel']) ?? 'standard'
  );
  const [island, setIsland] = useState<boolean>((defaults.includeIsland as boolean) ?? false);
  const [vanity, setVanity] = useState<boolean>((defaults.includeVanity as boolean) ?? false);
  const [panels, setPanels] = useState(num(defaults.endPanels ?? 0));
  const [color, setColor] = useState<CabinetRefinishingDetails['colorComplexity'] | null>(
    (defaults.colorComplexity as CabinetRefinishingDetails['colorComplexity']) ?? 'light'
  );
  const [damage, setDamage] = useState<CabinetRefinishingDetails['damage'] | null>(
    (defaults.damage as CabinetRefinishingDetails['damage']) ?? 'none'
  );
  const [rush, setRush] = useState<boolean>((defaults.rushProject as boolean) ?? false);

  const emit = useCallback(() => {
    const data: Record<string, unknown> = {
      cabinetDoors: Math.round(parseN(doors)),
      drawerFronts: Math.round(parseN(drawers)),
      finishLevel: finish,
      includeIsland: island,
      includeVanity: vanity,
      endPanels: Math.round(parseN(panels)),
      colorComplexity: color,
      damage,
      rushProject: rush,
    };
    const isValid = parseN(doors) >= 1 && finish !== null && color !== null && damage !== null;
    onChange(data, isValid);
  }, [doors, drawers, finish, island, vanity, panels, color, damage, rush, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Number of cabinet doors"
        type="number"
        min={1}
        placeholder="e.g. 24"
        value={doors}
        onChange={(e) => setDoors(e.target.value)}
        required
      />
      <Input
        label="Number of drawer fronts"
        type="number"
        min={0}
        placeholder="0"
        value={drawers}
        onChange={(e) => setDrawers(e.target.value)}
      />
      <Field label="Finish level">
        <SelectButtons
          options={[{ value: 'standard', label: 'Standard' }, { value: 'premium', label: 'Premium' }]}
          value={finish}
          onChange={setFinish}
        />
      </Field>
      <Field label="Include kitchen island?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(island)}
          onChange={(v) => setIsland(v === 'true')}
        />
      </Field>
      <Field label="Include bathroom vanity?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(vanity)}
          onChange={(v) => setVanity(v === 'true')}
        />
      </Field>
      <Input
        label="Number of end / side panels"
        type="number"
        min={0}
        placeholder="0"
        value={panels}
        onChange={(e) => setPanels(e.target.value)}
        hint="Exposed cabinet sides or filler panels."
      />
      <Field label="Color complexity">
        <SelectButtons
          options={[
            { value: 'light', label: 'Light color' },
            { value: 'dark', label: 'Dark color' },
            { value: 'stain', label: 'Stain + clear' },
          ]}
          value={color}
          onChange={setColor}
          cols={3}
        />
      </Field>
      <Field label="Existing damage or repairs needed?">
        <SelectButtons
          options={[
            { value: 'none', label: 'None' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'heavy', label: 'Heavy' },
          ]}
          value={damage}
          onChange={setDamage}
          cols={3}
        />
      </Field>
      <Field label="Rush project?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes — rush' }]}
          value={String(rush)}
          onChange={(v) => setRush(v === 'true')}
        />
      </Field>
    </div>
  );
}

// ─── Drywall ──────────────────────────────────────────────────────────────────

function DrywallForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [sheets, setSheets] = useState(num(defaults.sheets ?? 0));
  const [sqft, setSqft] = useState(num(defaults.squareFootage ?? 0));
  const [hang, setHang] = useState<boolean>((defaults.hangDrywall as boolean) ?? false);
  const [tape, setTape] = useState<boolean>((defaults.tapeAndFloat as boolean) ?? false);
  const [texture, setTexture] = useState<DrywallDetails['textureType'] | null>(
    (defaults.textureType as DrywallDetails['textureType']) ?? 'none'
  );

  const emit = useCallback(() => {
    const data: Record<string, unknown> = {
      sheets: Math.round(parseN(sheets)),
      squareFootage: parseN(sqft),
      hangDrywall: hang,
      tapeAndFloat: tape,
      textureType: texture,
    };
    const isValid = (parseN(sheets) > 0 || parseN(sqft) > 0) && texture !== null;
    onChange(data, isValid);
  }, [sheets, sqft, hang, tape, texture, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Field label="Include drywall hang / installation?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(hang)}
          onChange={(v) => setHang(v === 'true')}
        />
      </Field>
      {hang && (
        <Input
          label="Number of drywall sheets"
          type="number"
          min={1}
          placeholder="e.g. 40"
          value={sheets}
          onChange={(e) => setSheets(e.target.value)}
        />
      )}
      <Field label="Include tape & float?">
        <SelectButtons
          options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
          value={String(tape)}
          onChange={(v) => setTape(v === 'true')}
        />
      </Field>
      <Input
        label="Total area (sq ft)"
        type="number"
        min={1}
        placeholder="e.g. 800"
        value={sqft}
        onChange={(e) => setSqft(e.target.value)}
        unit="sq ft"
        hint="Used for tape & float and texture calculation."
      />
      <Field label="Texture finish">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {([
            { value: 'none', label: 'No texture' },
            { value: 'orange_peel', label: 'Orange Peel' },
            { value: 'knockdown', label: 'Knockdown' },
            { value: 'hand_trowel', label: 'Hand Trowel' },
            { value: 'smooth_finish', label: 'Smooth Finish' },
          ] as { value: DrywallDetails['textureType']; label: string }[]).map((o) => (
            <OptionCard
              key={o.value}
              value={o.value}
              label={o.label}
              selected={texture === o.value}
              onSelect={(v) => setTexture(v as DrywallDetails['textureType'])}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── Drywall Repair ───────────────────────────────────────────────────────────

function DrywallRepairForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [size, setSize] = useState<DrywallRepairDetails['repairSize'] | null>(
    (defaults.repairSize as DrywallRepairDetails['repairSize']) ?? null
  );

  const emit = useCallback(() => {
    const data: Record<string, unknown> = { repairSize: size };
    onChange(data, size !== null);
  }, [size, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Field label="How large is the repair area?">
        <SelectButtons
          options={[
            { value: 'small', label: 'Small — hairline crack or single hole' },
            { value: 'medium', label: 'Medium — multiple patches or larger area' },
            { value: 'large', label: 'Large — significant wall section or water damage' },
          ]}
          value={size}
          onChange={setSize}
          cols={3}
        />
      </Field>
      {size === 'large' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">On-site inspection recommended</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Large repairs vary significantly based on structural conditions. An in-person visit ensures accurate pricing.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

function TileForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [service, setService] = useState<TileDetails['tileService'] | null>(
    (defaults.tileService as TileDetails['tileService']) ?? null
  );
  const [sqft, setSqft] = useState(num(defaults.squareFootage));

  const emit = useCallback(() => {
    const data: Record<string, unknown> = {
      tileService: service,
      squareFootage: parseN(sqft),
    };
    const isFull = service === 'full_shower_remodel';
    const isValid = service !== null && (isFull || parseN(sqft) > 0);
    onChange(data, isValid);
  }, [service, sqft, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Field label="What type of tile work?">
        <SelectButtons
          options={[
            { value: 'tile_flooring', label: 'Tile Flooring' },
            { value: 'shower_tile', label: 'Shower Tile' },
            { value: 'backsplash', label: 'Backsplash' },
            { value: 'full_shower_remodel', label: 'Full Shower Remodel' },
            { value: 'lvp', label: 'Luxury Vinyl Plank (LVP)', description: '$2.00–$4.00 / sq ft' },
            { value: 'engineered_wood', label: 'Engineered Wood Flooring', description: '$3.50–$7.00 / sq ft' },
          ]}
          value={service}
          onChange={setService}
          cols={2}
        />
      </Field>
      {service && service !== 'full_shower_remodel' && (
        <Input
          label="Area (sq ft)"
          type="number"
          min={1}
          placeholder="e.g. 120"
          value={sqft}
          onChange={(e) => setSqft(e.target.value)}
          unit="sq ft"
          required
        />
      )}
      {service === 'full_shower_remodel' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            Full shower remodel pricing includes demolition, waterproofing, tile, and finishing. An on-site visit confirms the full scope.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Stain & Clear ────────────────────────────────────────────────────────────

function StainClearForm({ defaults, onChange }: { defaults: Record<string, unknown>; onChange: Props['onChange'] }) {
  const [type, setType] = useState<StainClearDetails['type'] | null>(
    (defaults.type as StainClearDetails['type']) ?? 'interior'
  );
  const [sqft, setSqft] = useState(num(defaults.squareFootage));
  const [sills, setSills] = useState(num(defaults.windowSills ?? 0));
  const [entryDoors, setEntryDoors] = useState(num(defaults.entryDoors ?? 0));

  const emit = useCallback(() => {
    const data: Record<string, unknown> = {
      type,
      squareFootage: parseN(sqft),
      windowSills: Math.round(parseN(sills)),
      entryDoors: Math.round(parseN(entryDoors)),
    };
    const isValid = type !== null && parseN(sqft) > 0;
    onChange(data, isValid);
  }, [type, sqft, sills, entryDoors, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <div className="flex flex-col gap-5">
      <Field label="Interior or exterior?">
        <SelectButtons
          options={[
            { value: 'interior', label: 'Interior' },
            { value: 'exterior', label: 'Exterior' },
          ]}
          value={type}
          onChange={setType}
        />
      </Field>
      <Input
        label="Surface area (sq ft)"
        type="number"
        min={1}
        placeholder="e.g. 200"
        value={sqft}
        onChange={(e) => setSqft(e.target.value)}
        unit="sq ft"
        required
      />
      <Input
        label="Number of window sills"
        type="number"
        min={0}
        placeholder="0"
        value={sills}
        onChange={(e) => setSills(e.target.value)}
        hint="Leave 0 if none."
      />
      <Input
        label="Number of entry doors"
        type="number"
        min={0}
        placeholder="0"
        value={entryDoors}
        onChange={(e) => setEntryDoors(e.target.value)}
        hint="Leave 0 if none."
      />
    </div>
  );
}

// ─── Main router ──────────────────────────────────────────────────────────────

const SERVICE_TITLES: Record<ServiceType, string> = {
  interior_painting: 'Interior Painting Details',
  exterior_painting: 'Exterior Painting Details',
  cabinet_refinishing: 'Cabinet Refinishing Details',
  drywall: 'Drywall Project Details',
  drywall_repair: 'Drywall Repair Details',
  tile: 'Tile Installation Details',
  stain_clear: 'Stain & Clear Details',
};

export default function ProjectQuestionsStep({ service, defaultValues, onChange }: Props) {
  const forms: Record<ServiceType, React.ReactNode> = {
    interior_painting: <InteriorForm defaults={defaultValues} onChange={onChange} />,
    exterior_painting: <ExteriorForm defaults={defaultValues} onChange={onChange} />,
    cabinet_refinishing: <CabinetForm defaults={defaultValues} onChange={onChange} />,
    drywall: <DrywallForm defaults={defaultValues} onChange={onChange} />,
    drywall_repair: <DrywallRepairForm defaults={defaultValues} onChange={onChange} />,
    tile: <TileForm defaults={defaultValues} onChange={onChange} />,
    stain_clear: <StainClearForm defaults={defaultValues} onChange={onChange} />,
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{SERVICE_TITLES[service]}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Provide as much detail as possible for the most accurate estimate range.
        </p>
      </div>
      {forms[service]}
    </div>
  );
}
