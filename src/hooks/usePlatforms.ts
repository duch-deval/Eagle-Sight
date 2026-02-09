import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import type { WeaponPlatform, DepotLocation } from "@/data/weaponsPlatforms";

// ============================================================
// FETCH ALL PLATFORMS (for list view)
// ============================================================
export function usePlatforms() {
  const [platforms, setPlatforms] = useState<WeaponPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlatforms = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("platforms")
        .select("*")
        .order("name");

      if (fetchError) {
        console.error("Error fetching platforms:", fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      // Transform Supabase rows to WeaponPlatform interface
      const transformed: WeaponPlatform[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        status: row.status,
        service: row.service,
        budgetKeyword: row.budget_keyword,
        // Merge display_data JSONB into the object
        description: row.display_data?.description || "",
        role: row.display_data?.role,
        contractors: row.display_data?.contractors || [row.prime_contractor].filter(Boolean),
        unitCost: row.display_data?.unitCost,
        inventory: row.display_data?.inventory,
        ioc: row.display_data?.ioc,
        crew: row.display_data?.crew,
        engine: row.display_data?.engine,
        performance: row.display_data?.performance,
        dimensions: row.display_data?.dimensions,
        armament: row.display_data?.armament,
        programOffice: row.display_data?.programOffice,
        lifecycleSummary: row.display_data?.lifecycleSummary,
        fleetStatus: row.display_data?.fleetStatus,
        operatingBases: row.display_data?.operatingBases,
        // These will be populated separately if needed
        depots: [],
      }));

      setPlatforms(transformed);
      setLoading(false);
    };

    fetchPlatforms();
  }, []);

  return { platforms, loading, error };
}

// ============================================================
// FETCH SINGLE PLATFORM BY ID (for detail view)
// ============================================================
export function usePlatformById(id: string | undefined) {
  const [platform, setPlatform] = useState<WeaponPlatform | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPlatform = async () => {
      setLoading(true);
      setError(null);

      // Fetch platform with depots and contacts in parallel
      const [platformRes, depotsRes, contactsRes] = await Promise.all([
        supabase.from("platforms").select("*").eq("id", id).single(),
        supabase
          .from("platform_depot_links")
          .select(`
            roles,
            depots (
              id,
              name,
              base,
              lat,
              lon,
              source,
              source_date
            )
          `)
          .eq("platform_id", id),
        supabase
          .from("platform_contacts")
          .select("*")
          .eq("platform_id", id)
          .order("name"),
      ]);

      if (platformRes.error) {
        console.error("Error fetching platform:", platformRes.error);
        setError(platformRes.error.message);
        setLoading(false);
        return;
      }

      const row = platformRes.data;
      if (!row) {
        setError("Platform not found");
        setLoading(false);
        return;
      }

      // Transform depots
      const depots: DepotLocation[] = (depotsRes.data || [])
        .filter((link: any) => link.depots)
        .map((link: any) => ({
          name: link.depots.name,
          base: link.depots.base,
          roles: link.roles || [],
          coordinates: {
            lat: link.depots.lat ? parseFloat(link.depots.lat) : undefined,
            lon: link.depots.lon ? parseFloat(link.depots.lon) : undefined,
          },
          source: link.depots.source,
          sourceDate: link.depots.source_date,
        }));

      // Transform contacts
      const keyContacts = (contactsRes.data || []).map((c: any) => ({
        name: c.name,
        title: c.title,
        organization: c.organization,
        email: c.email,
      }));

      // Build full platform object
      const transformed: WeaponPlatform = {
        id: row.id,
        name: row.name,
        category: row.category,
        status: row.status,
        service: row.service,
        budgetKeyword: row.budget_keyword,
        // Spread display_data
        description: row.display_data?.description || "",
        role: row.display_data?.role,
        contractors: row.display_data?.contractors || [row.prime_contractor].filter(Boolean),
        unitCost: row.display_data?.unitCost,
        inventory: row.display_data?.inventory,
        ioc: row.display_data?.ioc,
        firstFlight: row.display_data?.firstFlight,
        firstDeployed: row.display_data?.firstDeployed,
        crew: row.display_data?.crew,
        engine: row.display_data?.engine,
        powerplant: row.display_data?.powerplant,
        performance: row.display_data?.performance,
        dimensions: row.display_data?.dimensions,
        armament: row.display_data?.armament,
        programOffice: row.display_data?.programOffice,
        governanceNotes: row.display_data?.governanceNotes,
        lifecycleSummary: row.display_data?.lifecycleSummary,
        fleetStatus: row.display_data?.fleetStatus,
        accountabilitySummary: row.display_data?.accountabilitySummary,
        operatingBases: row.display_data?.operatingBases,
        intermediaries: row.display_data?.intermediaries,
        contractingNotes: row.display_data?.contractingNotes,
        activeVariants: row.display_data?.activeVariants,
        pointOfContact: row.display_data?.pointOfContact,
        // From joined tables
        depots,
        keyContacts,
      };

      setPlatform(transformed);
      setLoading(false);
    };

    fetchPlatform();
  }, [id]);

  return { platform, loading, error };
}

// ============================================================
// FETCH PLATFORM CONTACTS WITH AWARDS ACTIVITY
// ============================================================
export function usePlatformContactsWithAwards(platformId: string | undefined) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!platformId) {
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      setLoading(true);

      // Get platform contacts
      const { data: contactsData, error } = await supabase
        .from("platform_contacts")
        .select("*")
        .eq("platform_id", platformId)
        .order("name");

      if (error || !contactsData) {
        console.error("Error fetching contacts:", error);
        setLoading(false);
        return;
      }

      // For each contact with email, count their awards
      const enrichedContacts = await Promise.all(
        contactsData.map(async (contact) => {
          if (!contact.email) {
            return { ...contact, awardCount: 0, totalValue: 0 };
          }

          const email = contact.email.toLowerCase();

          // Count awards where this contact is involved
          const { data: awards } = await supabase
            .from("awards")
            .select("award_id, awarded_amount")
            .or(`approved_by.ilike.${email},prepared_user.ilike.${email},last_modified_by.ilike.${email}`);

          const awardCount = awards?.length || 0;
          const totalValue = awards?.reduce(
            (sum, a) => sum + (parseFloat(a.awarded_amount) || 0),
            0
          ) || 0;

          return { ...contact, awardCount, totalValue };
        })
      );

      setContacts(enrichedContacts);
      setLoading(false);
    };

    fetchContacts();
  }, [platformId]);

  return { contacts, loading };
}

// ============================================================
// SEARCH PLATFORMS
// ============================================================
export function useSearchPlatforms(query: string, category?: string) {
  const [results, setResults] = useState<WeaponPlatform[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query && (!category || category === "all")) {
        // Fetch all
        setLoading(true);
        const { data } = await supabase.from("platforms").select("*").order("name");
        
        const transformed = (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          status: row.status,
          service: row.service,
          budgetKeyword: row.budget_keyword,
          description: row.display_data?.description || "",
          role: row.display_data?.role,
          contractors: row.display_data?.contractors || [row.prime_contractor].filter(Boolean),
          unitCost: row.display_data?.unitCost,
          totalFunding: row.display_data?.totalFunding,
          depots: [],
        })) as WeaponPlatform[];

        setResults(transformed);
        setLoading(false);
        return;
      }

      setLoading(true);

      let queryBuilder = supabase.from("platforms").select("*");

      if (category && category !== "all") {
        queryBuilder = queryBuilder.eq("category", category);
      }

      if (query) {
        // Search in name, budget_keyword, or display_data
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,budget_keyword.ilike.%${query}%,service.ilike.%${query}%`
        );
      }

      const { data } = await queryBuilder.order("name");

      const transformed = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        status: row.status,
        service: row.service,
        budgetKeyword: row.budget_keyword,
        description: row.display_data?.description || "",
        role: row.display_data?.role,
        contractors: row.display_data?.contractors || [row.prime_contractor].filter(Boolean),
        unitCost: row.display_data?.unitCost,
        totalFunding: row.display_data?.totalFunding,
        depots: [],
      })) as WeaponPlatform[];

      setResults(transformed);
      setLoading(false);
    };

    search();
  }, [query, category]);

  return { results, loading };
}

// ============================================================
// FETCH ALL DEPOTS ACROSS ALL PLATFORMS (for master map)
// ============================================================
export interface DepotWithPlatform {
  depotId: string;
  name: string;
  base: string;
  roles: string[];
  coordinates?: { lat?: number; lon?: number };
  source?: string;
  sourceDate?: string;
  platformId: string;
  platformName: string;
  platformCategory: string;
}

export function useAllDepots() {
  const [depots, setDepots] = useState<DepotWithPlatform[]>([]);
  const [platformNames, setPlatformNames] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllDepots = async () => {
      setLoading(true);
      setError(null);

      const { data: linksData, error: linksError } = await supabase
        .from("platform_depot_links")
        .select(`
          roles,
          platform_id,
          depots (
            id,
            name,
            base,
            lat,
            lon,
            source,
            source_date
          ),
          platforms (
            id,
            name,
            category
          )
        `);

      if (linksError) {
        console.error("Error fetching all depots:", linksError);
        setError(linksError.message);
        setLoading(false);
        return;
      }

      const transformed: DepotWithPlatform[] = (linksData || [])
        .filter((link: any) => link.depots && link.platforms)
        .map((link: any) => ({
          depotId: link.depots.id,
          name: link.depots.name,
          base: link.depots.base,
          roles: link.roles || [],
          coordinates: {
            lat: link.depots.lat ? parseFloat(link.depots.lat) : undefined,
            lon: link.depots.lon ? parseFloat(link.depots.lon) : undefined,
          },
          source: link.depots.source,
          sourceDate: link.depots.source_date,
          platformId: link.platforms.id,
          platformName: link.platforms.name,
          platformCategory: link.platforms.category,
        }));

      // Unique platform names for filter dropdown
      const uniquePlatforms = new Map<string, string>();
      transformed.forEach((d) => {
        if (!uniquePlatforms.has(d.platformId)) {
          uniquePlatforms.set(d.platformId, d.platformName);
        }
      });

      const platformList = Array.from(uniquePlatforms.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setDepots(transformed);
      setPlatformNames(platformList);
      setLoading(false);
    };

    fetchAllDepots();
  }, []);

  return { depots, platformNames, loading, error };
}

// ============================================================
// GET UNIQUE CATEGORIES
// ============================================================
export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("platforms")
        .select("category")
        .not("category", "is", null);

      const unique = [...new Set((data || []).map((r) => r.category))].sort();
      setCategories(unique);
    };
    fetch();
  }, []);

  return categories;
}