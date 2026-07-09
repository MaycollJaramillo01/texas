import { z } from 'zod';

export const CustomerTypeSchema = z.enum(['homeowner', 'builder', 'property_manager']);
export const ServiceTypeSchema = z.enum([
  'interior_painting',
  'exterior_painting',
  'cabinet_refinishing',
  'drywall',
  'drywall_repair',
  'lvp_flooring',
  'tile',
  'stain_clear',
]);

export const InteriorPaintingSchema = z.object({
  squareFootage: z
    .number()
    .positive('Square footage must be greater than 0.')
    .max(30000, 'Please review: this value seems unusually high.'),
  condition: z.enum(['vacant', 'occupied']),
  includeCeilings: z.boolean(),
  includeTrim: z.boolean(),
  trimLinearFeet: z.number().min(0).max(10000),
  interiorDoors: z.number().int().min(0).max(200),
  ceilingHeight: z.enum(['8ft', '9ft', '10ft_plus']),
  rushProject: z.boolean(),
});

export const ExteriorPaintingSchema = z.object({
  squareFootage: z
    .number()
    .positive('Square footage must be greater than 0.')
    .max(30000, 'Please review: this value seems unusually high.'),
  surfaceType: z.enum(['standard', 'hardie', 'stucco', 'brick']),
  includeDeck: z.boolean(),
  deckSquareFootage: z.number().min(0).max(20000),
  includeFence: z.boolean(),
  fenceLinearFeet: z.number().min(0).max(10000),
  access: z.enum(['normal', 'two_stories']),
  heavyScraping: z.boolean(),
  strongColorChange: z.boolean(),
  extensiveRecaulking: z.boolean(),
});

export const CabinetRefinishingSchema = z
  .object({
    cabinetDoors: z.number().int().min(0).max(500),
    drawerFronts: z.number().int().min(0).max(500),
    finishLevel: z.enum(['standard', 'premium', 'color_change']),
    includeIsland: z.boolean(),
    endPanels: z.number().int().min(0).max(100),
  })
  .refine((d) => d.finishLevel === 'color_change' || d.cabinetDoors >= 1, {
    message: 'Number of cabinet doors must be at least 1.',
    path: ['cabinetDoors'],
  });

export const DrywallSchema = z.object({
  sheets: z.number().int().min(0).max(5000),
  hangDrywall: z.boolean(),
  tapeAndFloat: z.boolean(),
  tapeSquareFootage: z.number().min(0).max(100000),
  textureType: z.enum(['none', 'orange_peel', 'knockdown', 'hand_trowel', 'smooth_finish']),
  textureSquareFootage: z.number().min(0).max(100000),
});

export const DrywallRepairSchema = z.object({
  repairSize: z.enum(['small', 'medium', 'large']),
});

export const TileSchema = z.object({
  tileService: z.enum(['tile_flooring', 'shower_tile', 'backsplash', 'full_shower_remodel']),
  squareFootage: z.number().min(0).max(20000),
});

export const LvpFlooringSchema = z.object({
  squareFootage: z.number().positive('Square footage must be greater than 0.').max(20000),
});

export const StainClearSchema = z.object({
  type: z.enum(['interior', 'exterior']),
  squareFootage: z.number().positive().max(20000),
  windowSills: z.number().int().min(0).max(100),
  entryDoors: z.number().int().min(0).max(50),
});

export const LeadSchema = z.object({
  name: z.string().min(2, 'Please enter your full name.').max(100),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(7, 'Please enter a valid phone number.').max(20),
  city: z.string().min(2, 'Please enter your city.').max(100),
});

export const EstimateRequestSchema = z.object({
  customerType: CustomerTypeSchema,
  service: ServiceTypeSchema,
  projectDetails: z.record(z.unknown()),
  lead: LeadSchema,
});

export function validateProjectDetails(service: string, data: unknown) {
  switch (service) {
    case 'interior_painting':
      return InteriorPaintingSchema.parse(data);
    case 'exterior_painting':
      return ExteriorPaintingSchema.parse(data);
    case 'cabinet_refinishing':
      return CabinetRefinishingSchema.parse(data);
    case 'drywall':
      return DrywallSchema.parse(data);
    case 'drywall_repair':
      return DrywallRepairSchema.parse(data);
    case 'lvp_flooring':
      return LvpFlooringSchema.parse(data);
    case 'tile':
      return TileSchema.parse(data);
    case 'stain_clear':
      return StainClearSchema.parse(data);
    default:
      throw new Error('Invalid service type');
  }
}
