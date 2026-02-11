// ============================================================
// WEAPON PLATFORMS - TYPE DEFINITIONS ONLY
// Data is now fetched from Supabase via hooks in @/hooks/usePlatforms
// ============================================================

export type WeaponCategory =
  | "Aircraft"
  | "Naval"
  | "Electronic System"
  | "Rotorcraft"
  | "UAV";

export const weaponCategories: WeaponCategory[] = [
  "Aircraft",
  "Rotorcraft",
  "UAV",
  "Naval",
  "Electronic System",
];

export interface PlatformPointOfContact {
  organization: string;
  office?: string;
  location?: string;
  addressLines?: string[];
  phone?: string;
  email?: string;
  notes?: string;
}

export interface PlatformKeyContact {
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
}

export interface WeaponPerformance {
  maxSpeed?: string;
  cruiseSpeed?: string;
  range?: string;
  combatRadius?: string;
  ceiling?: string;
  payload?: string;
}

export interface WeaponDimensions {
  length?: string;
  span?: string;
  height?: string;
  emptyWeight?: string;
  maxTakeoffWeight?: string;
}

export interface DepotLocation {
  id?: string;
  name: string;
  base: string;
  roles: string[];
  coordinates?: {
    lat?: number;
    lon?: number;
  };
  source?: string;
  sourceDate?: string;
}

export interface WeaponPlatform {
  id: string;
  name: string;
  category: WeaponCategory;
  status: "Active" | "Development" | "Retired";
  description: string;
  role?: string;
  service?: string;
  contractors: string[];
  fscCode?: string;
  image?: string;
  firstFlight?: string;
  firstDeployed?: string;
  dateDeployed?: string;
  ioc?: string;
  foc?: string;
  totalFunding?: number;
  unitCost?: string;
  inventory?: string;
  procurementObjective?: string;
  crew?: string;
  powerplant?: string;
  engine?: string;
  performance?: WeaponPerformance;
  dimensions?: WeaponDimensions;
  armament?: string[];
  budgetKeyword?: string;
  pointOfContact?: PlatformPointOfContact;
  poc?: PlatformPointOfContact;
  activeVariants?: string[];

  // Program / lifecycle / governance
  programOffice?: string;
  governanceNotes?: string;
  lifecycleSummary?: string;
  fleetStatus?: string;
  accountabilitySummary?: string;

  // Sustainment
  depots?: DepotLocation[];
  operatingBases?: string[];
  intermediaries?: string[];
  contractingNotes?: string;

  // Contacts (from Supabase join)
  keyContacts?: PlatformKeyContact[];
}

// ============================================================
// DEPRECATED EXPORTS - For backward compatibility during migration
// Use hooks from @/hooks/usePlatforms instead
// ============================================================

/** @deprecated Use usePlatforms() hook instead */
export const weaponsPlatforms: WeaponPlatform[] = [];

/** @deprecated Use usePlatformById() hook instead */
export function getPlatformById(id: string): WeaponPlatform | undefined {
  console.warn("getPlatformById() is deprecated. Use usePlatformById() hook.");
  return undefined;
}

/** @deprecated Use useSearchPlatforms() hook instead */
export function searchWeapons(query: string, category?: string): WeaponPlatform[] {
  console.warn("searchWeapons() is deprecated. Use useSearchPlatforms() hook.");
  return [];
}

/** @deprecated Use usePlatforms() hook with filter instead */
export function getWeaponsByCategory(category: string): WeaponPlatform[] {
  console.warn("getWeaponsByCategory() is deprecated. Use usePlatforms() hook.");
  return [];
}

/** @deprecated Use usePlatforms() hook with contractor filter */
export function getContractors(): string[] {
  console.warn("getContractors() is deprecated.");
  return [];
}

/** @deprecated Use usePlatforms() hook with contractor filter */
export function getPlatformsByContractor(contractor: string): WeaponPlatform[] {
  console.warn("getPlatformsByContractor() is deprecated.");
  return [];
}