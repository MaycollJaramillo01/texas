import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Phone } from "lucide-react";
import { company } from "../data/company";
import WhatsAppIcon from "./WhatsAppIcon";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function num(v) { return v === undefined || v === null ? "" : String(v); }
function parseN(v) { const n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; }

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// ─── Reusable UI pieces ───────────────────────────────────────────────────────

function SelectionCard({ value, label, description, selected, onSelect }) {
  return (
    <button type="button" className={`selection-card${selected ? " selected" : ""}`} onClick={() => onSelect(value)}>
      <span className="selection-card-check" aria-hidden="true">
        <Check size={10} />
      </span>
      <span className="selection-card-label">{label}</span>
      {description && <span className="selection-card-desc">{description}</span>}
    </button>
  );
}

function SelectionGrid({ options, value, onChange, cols = 2 }) {
  return (
    <div className={`selection-grid cols-${cols}`}>
      {options.map((o) => (
        <SelectionCard key={o.value} value={o.value} label={o.label} description={o.description}
          selected={value === o.value} onSelect={onChange} />
      ))}
    </div>
  );
}

function InlineOptions({ options, value, onChange }) {
  return (
    <div className="inline-options">
      {options.map((o) => (
        <button key={o.value} type="button"
          className={`inline-option-btn${value === o.value ? " selected" : ""}`}
          onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div className="form-field">
      <span className="form-label">{label}{required && <span className="req"> *</span>}</span>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

function NumberInput({ label, value, onChange, placeholder, unit, required, hint }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <div style={{ position: "relative" }}>
        <input type="number" className="form-input" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} min="0" style={unit ? { paddingRight: "48px" } : undefined} />
        {unit && (
          <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
            fontSize: "11px", color: "var(--ash)", pointerEvents: "none" }}>{unit}</span>
        )}
      </div>
    </Field>
  );
}

// ─── Step 3 service forms ────────────────────────────────────────────────────

function InteriorForm({ defaults, onChange }) {
  const [sqft, setSqft] = useState(num(defaults.squareFootage));
  const [condition, setCondition] = useState(defaults.condition ?? "vacant");
  const [ceilings, setCeilings] = useState(defaults.includeCeilings ?? false);
  const [trim, setTrim] = useState(defaults.includeTrim ?? false);
  const [trimLf, setTrimLf] = useState(num(defaults.trimLinearFeet));
  const [doors, setDoors] = useState(num(defaults.interiorDoors ?? 0));
  const [height, setHeight] = useState(defaults.ceilingHeight ?? "8ft");
  const [rush, setRush] = useState(defaults.rushProject ?? false);

  const emit = useCallback(() => {
    const data = { squareFootage: parseN(sqft), condition, includeCeilings: ceilings, includeTrim: trim,
      trimLinearFeet: parseN(trimLf), interiorDoors: Math.round(parseN(doors)), ceilingHeight: height, rushProject: rush };
    onChange(data, parseN(sqft) > 0);
  }, [sqft, condition, ceilings, trim, trimLf, doors, height, rush, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <NumberInput label="Area to paint" value={sqft} onChange={setSqft} placeholder="e.g. 2,000" unit="sq ft" required
        hint="Total interior square footage of the area to be painted." />
      <Field label="House condition" required>
        <InlineOptions options={[{ value: "vacant", label: "Vacant" }, { value: "occupied", label: "Occupied" }]}
          value={condition} onChange={setCondition} />
      </Field>
      <Field label="Include ceiling painting?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(ceilings)} onChange={(v) => setCeilings(v === "true")} />
      </Field>
      <Field label="Include trim / molding?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(trim)} onChange={(v) => setTrim(v === "true")} />
      </Field>
      {trim && (
        <NumberInput label="Trim linear footage" value={trimLf} onChange={setTrimLf} placeholder="e.g. 350" unit="lin ft" />
      )}
      <NumberInput label="Interior doors to paint" value={doors} onChange={setDoors} placeholder="0"
        hint="Enter 0 if none." />
      <Field label="Ceiling height" required>
        <div className="selection-grid cols-3">
          {[{ value: "8ft", label: "8 ft" }, { value: "9ft", label: "9 ft" }, { value: "10ft_plus", label: "10 ft +" }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={height === o.value} onSelect={setHeight} />)}
        </div>
      </Field>
      <Field label="Rush project?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes — rush" }]}
          value={String(rush)} onChange={(v) => setRush(v === "true")} />
      </Field>
    </>
  );
}

function ExteriorForm({ defaults, onChange }) {
  const [sqft, setSqft] = useState(num(defaults.squareFootage));
  const [surface, setSurface] = useState(defaults.surfaceType ?? "standard");
  const [deck, setDeck] = useState(defaults.includeDeck ?? false);
  const [deckSqft, setDeckSqft] = useState(num(defaults.deckSquareFootage));
  const [fence, setFence] = useState(defaults.includeFence ?? false);
  const [fenceLf, setFenceLf] = useState(num(defaults.fenceLinearFeet));
  const [access, setAccess] = useState(defaults.access ?? "normal");
  const [scraping, setScraping] = useState(defaults.heavyScraping ?? false);
  const [colorChange, setColorChange] = useState(defaults.strongColorChange ?? false);
  const [recaulk, setRecaulk] = useState(defaults.extensiveRecaulking ?? false);

  const emit = useCallback(() => {
    const data = { squareFootage: parseN(sqft), surfaceType: surface, includeDeck: deck,
      deckSquareFootage: parseN(deckSqft), includeFence: fence, fenceLinearFeet: parseN(fenceLf),
      access, heavyScraping: scraping, strongColorChange: colorChange, extensiveRecaulking: recaulk };
    onChange(data, parseN(sqft) > 0);
  }, [sqft, surface, deck, deckSqft, fence, fenceLf, access, scraping, colorChange, recaulk, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <NumberInput label="Exterior area" value={sqft} onChange={setSqft} placeholder="e.g. 2,500" unit="sq ft" required />
      <Field label="Primary surface type" required>
        <div className="selection-grid cols-2">
          {[{ value: "standard", label: "Standard siding" }, { value: "hardie", label: "Hardie" },
            { value: "stucco", label: "Stucco" }, { value: "brick", label: "Brick" }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={surface === o.value} onSelect={setSurface} />)}
        </div>
      </Field>
      <Field label="Include deck staining?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(deck)} onChange={(v) => setDeck(v === "true")} />
      </Field>
      {deck && <NumberInput label="Deck area" value={deckSqft} onChange={setDeckSqft} placeholder="e.g. 400" unit="sq ft" />}
      <Field label="Include fence staining?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(fence)} onChange={(v) => setFence(v === "true")} />
      </Field>
      {fence && <NumberInput label="Fence length" value={fenceLf} onChange={setFenceLf} placeholder="e.g. 200" unit="lin ft" />}
      <Field label="Property access" required>
        <InlineOptions options={[{ value: "normal", label: "Single story" }, { value: "two_stories", label: "Two stories" }]}
          value={access} onChange={setAccess} />
      </Field>
      <Field label="Heavy scraping or prep needed?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(scraping)} onChange={(v) => setScraping(v === "true")} />
      </Field>
      <Field label="Strong color change?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(colorChange)} onChange={(v) => setColorChange(v === "true")} />
      </Field>
      <Field label="Extensive recaulking needed?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(recaulk)} onChange={(v) => setRecaulk(v === "true")} />
      </Field>
    </>
  );
}

function CabinetForm({ defaults, onChange }) {
  const [doors, setDoors] = useState(num(defaults.cabinetDoors));
  const [drawers, setDrawers] = useState(num(defaults.drawerFronts ?? 0));
  const [finish, setFinish] = useState(defaults.finishLevel ?? "standard");
  const [island, setIsland] = useState(defaults.includeIsland ?? false);
  const [vanity, setVanity] = useState(defaults.includeVanity ?? false);
  const [panels, setPanels] = useState(num(defaults.endPanels ?? 0));
  const [color, setColor] = useState(defaults.colorComplexity ?? "light");
  const [damage, setDamage] = useState(defaults.damage ?? "none");
  const [rush, setRush] = useState(defaults.rushProject ?? false);

  const emit = useCallback(() => {
    const data = { cabinetDoors: Math.round(parseN(doors)), drawerFronts: Math.round(parseN(drawers)),
      finishLevel: finish, includeIsland: island, includeVanity: vanity, endPanels: Math.round(parseN(panels)),
      colorComplexity: color, damage, rushProject: rush };
    onChange(data, parseN(doors) >= 1);
  }, [doors, drawers, finish, island, vanity, panels, color, damage, rush, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <NumberInput label="Number of cabinet doors" value={doors} onChange={setDoors} placeholder="e.g. 24" required
        hint="Count each individual cabinet door." />
      <NumberInput label="Number of drawer fronts" value={drawers} onChange={setDrawers} placeholder="0" />
      <Field label="Finish level" required>
        <InlineOptions options={[{ value: "standard", label: "Standard" }, { value: "premium", label: "Premium" }]}
          value={finish} onChange={setFinish} />
      </Field>
      <Field label="Include kitchen island?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(island)} onChange={(v) => setIsland(v === "true")} />
      </Field>
      <Field label="Include bathroom vanity?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(vanity)} onChange={(v) => setVanity(v === "true")} />
      </Field>
      <NumberInput label="End / side panels" value={panels} onChange={setPanels} placeholder="0"
        hint="Exposed cabinet sides or filler panels." />
      <Field label="Color complexity" required>
        <div className="selection-grid cols-3">
          {[{ value: "light", label: "Light color" }, { value: "dark", label: "Dark color" }, { value: "stain", label: "Stain + clear" }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={color === o.value} onSelect={setColor} />)}
        </div>
      </Field>
      <Field label="Existing damage or repairs needed?" required>
        <div className="selection-grid cols-3">
          {[{ value: "none", label: "None" }, { value: "moderate", label: "Moderate" }, { value: "heavy", label: "Heavy" }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={damage === o.value} onSelect={setDamage} />)}
        </div>
      </Field>
      <Field label="Rush project?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes — rush" }]}
          value={String(rush)} onChange={(v) => setRush(v === "true")} />
      </Field>
    </>
  );
}

function DrywallForm({ defaults, onChange }) {
  const [sheets, setSheets] = useState(num(defaults.sheets ?? 0));
  const [sqft, setSqft] = useState(num(defaults.squareFootage ?? 0));
  const [hang, setHang] = useState(defaults.hangDrywall ?? false);
  const [tape, setTape] = useState(defaults.tapeAndFloat ?? false);
  const [texture, setTexture] = useState(defaults.textureType ?? "none");

  const emit = useCallback(() => {
    const data = { sheets: Math.round(parseN(sheets)), squareFootage: parseN(sqft),
      hangDrywall: hang, tapeAndFloat: tape, textureType: texture };
    onChange(data, parseN(sheets) > 0 || parseN(sqft) > 0);
  }, [sheets, sqft, hang, tape, texture, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <Field label="Include drywall hang / installation?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(hang)} onChange={(v) => setHang(v === "true")} />
      </Field>
      {hang && <NumberInput label="Number of drywall sheets" value={sheets} onChange={setSheets} placeholder="e.g. 40" />}
      <Field label="Include tape & float?">
        <InlineOptions options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
          value={String(tape)} onChange={(v) => setTape(v === "true")} />
      </Field>
      <NumberInput label="Total area" value={sqft} onChange={setSqft} placeholder="e.g. 800" unit="sq ft"
        hint="Used for tape & float and texture calculation." />
      <Field label="Texture finish" required>
        <div className="selection-grid cols-2">
          {[{ value: "none", label: "No texture" }, { value: "orange_peel", label: "Orange Peel" },
            { value: "knockdown", label: "Knockdown" }, { value: "hand_trowel", label: "Hand Trowel" },
            { value: "smooth_finish", label: "Smooth Finish" }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={texture === o.value} onSelect={setTexture} />)}
        </div>
      </Field>
    </>
  );
}

function DrywallRepairForm({ defaults, onChange }) {
  const [size, setSize] = useState(defaults.repairSize ?? null);

  const emit = useCallback(() => {
    onChange({ repairSize: size }, size !== null);
  }, [size, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <Field label="How large is the repair area?" required>
        <div className="selection-grid cols-1">
          {[{ value: "small", label: "Small", description: "Hairline crack or a single punch-through hole." },
            { value: "medium", label: "Medium", description: "Multiple patches or a larger damaged area." },
            { value: "large", label: "Large", description: "Significant wall section, water damage, or structural issues." }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={size === o.value} onSelect={setSize} />)}
        </div>
      </Field>
      {size === "large" && (
        <div className="inspection-notice">
          <div>
            <p>On-site inspection strongly recommended</p>
            <p>Large repairs vary significantly based on structural conditions. A verification visit ensures accurate pricing.</p>
          </div>
        </div>
      )}
    </>
  );
}

function TileForm({ defaults, onChange }) {
  const [svc, setSvc] = useState(defaults.tileService ?? null);
  const [sqft, setSqft] = useState(num(defaults.squareFootage));

  const emit = useCallback(() => {
    const isFull = svc === "full_shower_remodel";
    onChange({ tileService: svc, squareFootage: parseN(sqft) }, svc !== null && (isFull || parseN(sqft) > 0));
  }, [svc, sqft, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <Field label="Type of tile work" required>
        <div className="selection-grid cols-2">
          {[{ value: "tile_flooring", label: "Tile Flooring" }, { value: "shower_tile", label: "Shower Tile" },
            { value: "backsplash", label: "Backsplash" }, { value: "full_shower_remodel", label: "Full Shower Remodel" }]
            .map((o) => <SelectionCard key={o.value} {...o} selected={svc === o.value} onSelect={setSvc} />)}
        </div>
      </Field>
      {svc && svc !== "full_shower_remodel" && (
        <NumberInput label="Area" value={sqft} onChange={setSqft} placeholder="e.g. 120" unit="sq ft" required />
      )}
      {svc === "full_shower_remodel" && (
        <p className="form-hint" style={{ padding: "12px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--radius)" }}>
          Full shower remodel pricing includes demolition, waterproofing, tile, and finishing. An on-site visit confirms the full scope.
        </p>
      )}
    </>
  );
}

function StainClearForm({ defaults, onChange }) {
  const [type, setType] = useState(defaults.type ?? "interior");
  const [sqft, setSqft] = useState(num(defaults.squareFootage));
  const [sills, setSills] = useState(num(defaults.windowSills ?? 0));
  const [entryDoors, setEntryDoors] = useState(num(defaults.entryDoors ?? 0));

  const emit = useCallback(() => {
    onChange({ type, squareFootage: parseN(sqft), windowSills: Math.round(parseN(sills)), entryDoors: Math.round(parseN(entryDoors)) },
      parseN(sqft) > 0);
  }, [type, sqft, sills, entryDoors, onChange]);

  useEffect(() => { emit(); }, [emit]);

  return (
    <>
      <Field label="Interior or exterior?" required>
        <InlineOptions options={[{ value: "interior", label: "Interior" }, { value: "exterior", label: "Exterior" }]}
          value={type} onChange={setType} />
      </Field>
      <NumberInput label="Surface area" value={sqft} onChange={setSqft} placeholder="e.g. 200" unit="sq ft" required />
      <NumberInput label="Number of window sills" value={sills} onChange={setSills} placeholder="0" hint="Leave 0 if none." />
      <NumberInput label="Number of entry doors" value={entryDoors} onChange={setEntryDoors} placeholder="0" hint="Leave 0 if none." />
    </>
  );
}

// ─── Step configs ─────────────────────────────────────────────────────────────

const CUSTOMER_OPTIONS = [
  { value: "homeowner", label: "Homeowner", description: "You own the property and are looking to renovate or refresh your home." },
  { value: "builder", label: "Builder / Contractor", description: "Professional builder or contractor with recurring project needs." },
  { value: "property_manager", label: "Property Manager", description: "You manage rental properties or a portfolio of residential units." },
];

const SERVICE_OPTIONS = [
  { value: "interior_painting", label: "Interior Painting", description: "Walls, ceilings, trim, and interior doors." },
  { value: "exterior_painting", label: "Exterior Painting", description: "Siding, stucco, brick, fences, and decks." },
  { value: "cabinet_refinishing", label: "Cabinet Refinishing", description: "Kitchen, bathroom, and custom cabinet doors." },
  { value: "drywall", label: "Drywall", description: "New installation, tape & float, and texture finishes." },
  { value: "drywall_repair", label: "Drywall Repair", description: "Patch and repair holes, cracks, or water damage." },
  { value: "tile", label: "Tile Installation", description: "Floors, showers, backsplash, and full shower remodels." },
  { value: "stain_clear", label: "Stain & Clear", description: "Interior/exterior wood staining and clear coat finishes." },
];

const SERVICE_LABELS = {
  interior_painting: "Interior Painting",
  exterior_painting: "Exterior Painting",
  cabinet_refinishing: "Cabinet Refinishing",
  drywall: "Drywall",
  drywall_repair: "Drywall Repair",
  tile: "Tile Installation",
  stain_clear: "Stain & Clear",
};

const STEP_LABELS = ["Client Type", "Service", "Project Details", "Your Info", "Estimate"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_LEAD = { name: "", email: "", phone: "", city: "" };

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function EstimatorWizard({ initialService }) {
  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState(null);
  const [service, setService] = useState(initialService ?? null);
  const [details, setDetails] = useState({});
  const [detailsValid, setDetailsValid] = useState(false);
  const [lead, setLead] = useState(EMPTY_LEAD);
  const [leadTouched, setLeadTouched] = useState({ name: false, email: false, phone: false, city: false });
  const [estimate, setEstimate] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Jump to step 2 if an initial service was provided (from home page quick-select)
  useEffect(() => {
    if (initialService) setStep(2);
  }, [initialService]);

  const handleDetailsChange = useCallback((data, valid) => {
    setDetails(data);
    setDetailsValid(valid);
  }, []);

  const leadValid = lead.name.trim().length >= 2 && EMAIL_RE.test(lead.email) &&
    lead.phone.trim().length >= 7 && lead.city.trim().length >= 2;

  const canContinue = step === 1 ? !!customerType
    : step === 2 ? !!service
    : step === 3 ? detailsValid
    : step === 4 ? leadValid
    : false;

  const pct = Math.round(((step - 1) / 4) * 100);

  const goBack = () => { setApiError(null); setStep((s) => Math.max(1, s - 1)); };

  const goNext = async () => {
    if (step < 4) { setStep((s) => s + 1); return; }
    await submit();
  };

  const submit = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerType, service, projectDetails: details, lead }),
      });
      const json = await res.json();
      if (!json.success || !json.estimate) {
        setApiError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setEstimate(json.estimate);
      setResultMessage(json.message ?? "");
      setStep(5);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setStep(1); setCustomerType(null); setService(null); setDetails({}); setDetailsValid(false);
    setLead(EMPTY_LEAD); setLeadTouched({ name: false, email: false, phone: false, city: false });
    setEstimate(null); setApiError(null);
  };

  return (
    <div className="estimator-wrapper">
      {/* Progress */}
      {step < 5 && (
        <div className="wizard-progress">
          <div className="wizard-progress-meta">
            <span>Step {step} of 5 — {STEP_LABELS[step - 1]}</span>
            <span>{pct}%</span>
          </div>
          <div className="wizard-progress-track">
            <div className="wizard-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Card */}
      <div className="wizard-step">

        {/* ── Step 1: Customer type ── */}
        {step === 1 && (
          <>
            <div className="wizard-step-heading">
              <p className="eyebrow">Step 1</p>
              <h2>Who is this project for?</h2>
              <p>Select the option that best describes you. This helps us provide the most accurate range.</p>
            </div>
            <SelectionGrid options={CUSTOMER_OPTIONS} value={customerType} onChange={setCustomerType} cols={3} />
          </>
        )}

        {/* ── Step 2: Service ── */}
        {step === 2 && (
          <>
            <div className="wizard-step-heading">
              <p className="eyebrow">Step 2</p>
              <h2>What service do you need?</h2>
              <p>Select the primary service. You can discuss additional work during the verification visit.</p>
            </div>
            <SelectionGrid options={SERVICE_OPTIONS} value={service}
              onChange={(v) => { setService(v); setDetails({}); setDetailsValid(false); }} cols={2} />
          </>
        )}

        {/* ── Step 3: Project details ── */}
        {step === 3 && service && (
          <>
            <div className="wizard-step-heading">
              <p className="eyebrow">Step 3</p>
              <h2>{SERVICE_LABELS[service]} — <em>project details</em></h2>
              <p>Provide as much detail as possible for the most accurate estimate range.</p>
            </div>
            {service === "interior_painting"   && <InteriorForm    defaults={details} onChange={handleDetailsChange} />}
            {service === "exterior_painting"   && <ExteriorForm    defaults={details} onChange={handleDetailsChange} />}
            {service === "cabinet_refinishing" && <CabinetForm     defaults={details} onChange={handleDetailsChange} />}
            {service === "drywall"             && <DrywallForm     defaults={details} onChange={handleDetailsChange} />}
            {service === "drywall_repair"      && <DrywallRepairForm defaults={details} onChange={handleDetailsChange} />}
            {service === "tile"                && <TileForm        defaults={details} onChange={handleDetailsChange} />}
            {service === "stain_clear"         && <StainClearForm  defaults={details} onChange={handleDetailsChange} />}
          </>
        )}

        {/* ── Step 4: Lead capture ── */}
        {step === 4 && (
          <>
            <div className="wizard-step-heading">
              <p className="eyebrow">Step 4</p>
              <h2>Where should we send your estimate?</h2>
              <p>Your information is kept private and used only to send your estimate and schedule your visit.</p>
            </div>

            {[
              { key: "name",  label: "Full name",        type: "text",  placeholder: "Esdras Paz",              auto: "name" },
              { key: "email", label: "Email address",    type: "email", placeholder: "you@example.com",          auto: "email" },
              { key: "phone", label: "Phone number",     type: "tel",   placeholder: "(830) 596-3323",           auto: "tel" },
              { key: "city",  label: "City / Location",  type: "text",  placeholder: "Marble Falls, TX",         auto: "address-level2" },
            ].map(({ key, label, type, placeholder, auto }) => {
              const touched = leadTouched[key];
              let err = null;
              if (touched) {
                if (key === "name"  && lead.name.trim().length < 2)  err = "Please enter your full name.";
                if (key === "email" && !EMAIL_RE.test(lead.email))   err = "Please enter a valid email address.";
                if (key === "phone" && lead.phone.trim().length < 7)  err = "Please enter a valid phone number.";
                if (key === "city"  && lead.city.trim().length < 2)  err = "Please enter your city.";
              }
              return (
                <div className="form-field" key={key}>
                  <span className="form-label">{label} <span className="req">*</span></span>
                  <input type={type} className={`form-input${err ? " error" : ""}`} value={lead[key]}
                    placeholder={placeholder} autoComplete={auto}
                    onChange={(e) => setLead((p) => ({ ...p, [key]: e.target.value }))}
                    onBlur={() => setLeadTouched((p) => ({ ...p, [key]: true }))} />
                  {err && <span className="form-error">{err}</span>}
                </div>
              );
            })}
            <p className="form-hint" style={{ marginTop: "4px" }}>
              By submitting, you agree to be contacted by Texas High Refinished regarding your project.
            </p>
          </>
        )}

        {/* ── Step 5: Result ── */}
        {step === 5 && estimate && (
          <div className="estimate-result">
            <span className="estimate-result-badge">
              <Check size={12} />
              Estimate Ready
            </span>
            <h2>Your Estimated Investment</h2>
            <p className="estimate-result-service">Service: {SERVICE_LABELS[service]}</p>

            {estimate.inspectionRecommended && (
              <div className="inspection-notice" style={{ marginBottom: "24px", textAlign: "left" }}>
                <div>
                  <p>On-site inspection strongly recommended</p>
                  <p>Large or complex repairs vary significantly. A verification visit ensures accurate final pricing.</p>
                </div>
              </div>
            )}

            <div className="estimate-ranges">
              <div className="estimate-range-card">
                <span className="estimate-range-label">Low Range</span>
                <span className="estimate-range-value">{fmt(estimate.low)}</span>
                <span className="estimate-range-sub">Favorable conditions</span>
              </div>
              <div className="estimate-range-card featured">
                <span className="estimate-range-label">Typical Project</span>
                <span className="estimate-range-value">{fmt(estimate.typical)}</span>
                <span className="estimate-range-sub">Most common outcome</span>
              </div>
              <div className="estimate-range-card">
                <span className="estimate-range-label">Premium</span>
                <span className="estimate-range-value">{fmt(estimate.premium)}</span>
                <span className="estimate-range-sub">Complex conditions</span>
              </div>
            </div>

            <p className="estimate-disclaimer">{resultMessage}</p>

            <div className="estimate-result-actions">
              <a href={company.contact.whatsapp} target="_blank" rel="noreferrer" className="estimate-cta-primary">
                <WhatsAppIcon size={18} aria-hidden="true" />
                Schedule Verification Visit
              </a>
              <a href={`tel:${company.contact.phoneRaw}`} className="estimate-cta-primary"
                style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--ink)", marginTop: "4px" }}>
                <Phone size={16} aria-hidden="true" />
                {company.contact.phone}
              </a>
              <button type="button" className="estimate-cta-secondary" onClick={startOver}>
                Start a new estimate
              </button>
            </div>

            <p className="form-hint" style={{ marginTop: "20px", textAlign: "center" }}>
              Marble Falls, TX · Licensed, bonded &amp; insured · Est. 2019
            </p>
          </div>
        )}

        {/* API error */}
        {apiError && <div className="wizard-error">{apiError}</div>}

        {/* Navigation */}
        {step < 5 && (
          <div className="wizard-nav">
            <button type="button" className="button secondary" onClick={goBack} disabled={step === 1}
              style={{ opacity: step === 1 ? 0.3 : 1, pointerEvents: step === 1 ? "none" : undefined }}>
              ← Back
            </button>
            <button type="button" className="button primary" onClick={goNext}
              disabled={!canContinue || loading}
              style={{ opacity: !canContinue || loading ? 0.4 : 1, pointerEvents: !canContinue || loading ? "none" : undefined }}>
              {loading ? "Calculating…" : step === 4 ? "Get My Estimate →" : "Continue →"}
            </button>
          </div>
        )}
      </div>

      {/* Trust row */}
      {step < 5 && (
        <div className="wizard-trust">
          <span><Check size={12} /> Licensed, bonded &amp; insured</span>
          <span><Check size={12} /> No commitment required</span>
          <span><Check size={12} /> Texas Hill Country · Est. 2019</span>
        </div>
      )}
    </div>
  );
}
