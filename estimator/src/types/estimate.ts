export type CustomerType = 'homeowner' | 'builder' | 'property_manager';

export type ServiceType =
  | 'interior_painting'
  | 'exterior_painting'
  | 'cabinet_refinishing'
  | 'drywall'
  | 'drywall_repair'
  | 'lvp_flooring'
  | 'tile'
  | 'stain_clear';

// ─── Project detail shapes ───────────────────────────────────────────────────

export interface InteriorPaintingDetails {
  squareFootage: number;
  condition: 'vacant' | 'occupied';
  includeCeilings: boolean;
  includeTrim: boolean;
  trimLinearFeet: number;
  interiorDoors: number;
  ceilingHeight: '8ft' | '9ft' | '10ft_plus';
  rushProject: boolean;
}

export interface ExteriorPaintingDetails {
  squareFootage: number;
  surfaceType: 'standard' | 'hardie' | 'stucco' | 'brick';
  includeDeck: boolean;
  deckSquareFootage: number;
  includeFence: boolean;
  fenceLinearFeet: number;
  access: 'normal' | 'two_stories';
  heavyScraping: boolean;
  strongColorChange: boolean;
  extensiveRecaulking: boolean;
}

export interface CabinetRefinishingDetails {
  cabinetDoors: number;
  drawerFronts: number;
  finishLevel: 'standard' | 'premium' | 'color_change';
  includeIsland: boolean;
  endPanels: number;
}

export interface DrywallDetails {
  sheets: number;
  hangDrywall: boolean;
  tapeAndFloat: boolean;
  tapeSquareFootage: number;
  textureType: 'none' | 'orange_peel' | 'knockdown' | 'hand_trowel' | 'smooth_finish';
  textureSquareFootage: number;
}

export interface DrywallRepairDetails {
  repairSize: 'small' | 'medium' | 'large';
}

export interface TileDetails {
  tileService: 'tile_flooring' | 'shower_tile' | 'backsplash' | 'full_shower_remodel';
  squareFootage: number;
}

export interface LvpFlooringDetails {
  squareFootage: number;
}

export interface StainClearDetails {
  type: 'interior' | 'exterior';
  squareFootage: number;
  windowSills: number;
  entryDoors: number;
}

export type ProjectDetails =
  | InteriorPaintingDetails
  | ExteriorPaintingDetails
  | CabinetRefinishingDetails
  | DrywallDetails
  | DrywallRepairDetails
  | LvpFlooringDetails
  | TileDetails
  | StainClearDetails;

// ─── Lead & result ────────────────────────────────────────────────────────────

export interface LeadInfo {
  name: string;
  email: string;
  phone: string;
  city: string;
}

export interface EstimateRange {
  low: number;
  typical: number;
  premium: number;
  inspectionRecommended: boolean;
}

export interface EstimateRequest {
  customerType: CustomerType;
  service: ServiceType;
  projectDetails: Record<string, unknown>;
  lead: LeadInfo;
}

export interface EstimateResponse {
  success: boolean;
  estimate?: EstimateRange;
  message?: string;
  error?: string;
}

// ─── Wizard UI state ─────────────────────────────────────────────────────────

export interface WizardData {
  customerType: CustomerType | null;
  service: ServiceType | null;
  projectDetails: Record<string, unknown>;
  lead: {
    name: string;
    email: string;
    phone: string;
    city: string;
  };
}
