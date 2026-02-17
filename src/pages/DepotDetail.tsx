import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, Plane, FileText, Shield, Wrench, Radio, User } from "lucide-react";
import { useDepotById } from "@/hooks/usePlatforms";
import supabase from "@/lib/supabaseClient";
import { CorporateButton, SectionHeader, CorporateCard } from "@/components/ui/TacticalComponents";
import { WeaponPlatformCard } from "@/components/dashboard/WeaponPlatformCard";
import { EntityCard } from "@/components/dashboard/EntityCard";
import FunctionalTreeMap from "@/components/dashboard/FunctionalTreeMap";

// Helper to map entity names to images
const getImageForEntity = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("dla")) return `${import.meta.env.BASE_URL}DLA.svg`;
  if (n.includes("lakehurst")) return `${import.meta.env.BASE_URL}NAWCAD Lakehurst.jpg`;
  if (n.includes("pax river")) return `${import.meta.env.BASE_URL}NAVAIR Pax River.jpg`;
  if (n.includes("pma-261") || n.includes("261")) return `${import.meta.env.BASE_URL}pma_261.png`;
  if (n.includes("f-35") || n.includes("jpo")) return `${import.meta.env.BASE_URL}f35jpo.png`;

  // Default fallback (can be specific or generic)
  return `${import.meta.env.BASE_URL}eagle-icon.ico`;
};

const DepotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch from Supabase
  const { depot, loading, error } = useDepotById(id);

  // Fetch contacts for all platforms linked to this depot
  const [platformContacts, setPlatformContacts] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!depot?.platforms?.length) return;

    const fetchContacts = async () => {
      const platformIds = depot.platforms.map((p) => p.id);
      const { data } = await supabase
        .from("platform_contacts")
        .select("*")
        .in("platform_id", platformIds)
        .order("name");

      // Group by platform_id
      const grouped: Record<string, any[]> = {};
      (data || []).forEach((c) => {
        if (!grouped[c.platform_id]) grouped[c.platform_id] = [];
        grouped[c.platform_id].push(c);
      });
      setPlatformContacts(grouped);
    };

    fetchContacts();
  }, [depot]);

  // Extract unique PMAs
  const platformPmas = depot
    ? (Array.from(new Set(depot.platforms.map((p) => p.pmaCode).filter(Boolean))) as string[])
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-corporate-blue" />
          <span className="text-slate-500">Loading sustainment data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Depot</h1>
          <p className="text-slate-500 mb-4">{error}</p>
          <CorporateButton onClick={() => navigate("/platforms")}>Return to Map</CorporateButton>
        </div>
      </div>
    );
  }

  // Not found state
  if (!depot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-corporate-navy mb-4">Depot Not Found</h1>
          <CorporateButton onClick={() => navigate("/platforms")}>Return to Map</CorporateButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* BREADCRUMB / TOP NAV */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="container mx-auto px-4 h-10 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <button
            onClick={() => navigate("/platforms")}
            className="flex items-center hover:text-corporate-blue transition-colors"
          >
            <ArrowLeft className="h-3 w-3 mr-2" /> Back to Sustainment Network
          </button>
          <div className="flex gap-4">
            <span>SUSTAINMENT NODE</span>
            <span className="text-slate-300">|</span>
            <span className="text-corporate-blue">{depot.name}</span>
          </div>
        </div>
      </div>

      {/* HERO BANNER - REDESIGNED */}
      <div className="relative bg-corporate-navy h-[320px] flex items-center border-b-4 border-corporate-blue">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
          {/* User Requested Background Image */}
          <img
            src={`${import.meta.env.BASE_URL}mcas cherry point.jpg`}
            className="w-full h-full object-cover"
            alt={depot.name}
            onError={(e) => {
              // Fallback if image fails or path is slightly off
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542255734-6019a2e37e96?q=80&w=2670";
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              {depot.base && (
                <div className="text-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {depot.base}
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-none tracking-tight">{depot.name}</h1>
          </div>
        </div>
      </div>

      {/* QUICK STATS BAR - RE-ADDED TO MATCH WEAPON PLATFORM STYLING */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-300">
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                Supported Platforms
              </div>
              <div className="text-lg font-bold text-corporate-navy">{depot.platforms.length}</div>
            </div>
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Unique PMAs</div>
              <div className="text-lg font-bold text-corporate-blue">
                {new Set(depot.platforms.map((p) => p.pmaCode).filter(Boolean)).size}
              </div>
            </div>
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Level</div>
              <div className="text-lg font-bold text-corporate-navy">Depot (D-Level)</div>
            </div>
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Last Updated</div>
              <div className="text-lg font-bold text-corporate-navy">
                {depot.sourceDate ? new Date(depot.sourceDate).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT TABS & BODY */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Column */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 mb-8">
              <nav className="flex gap-8">
                {["overview", "contracting", "program management"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-corporate-blue text-corporate-blue"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab: OVERVIEW — Map first, then Supported Platforms */}
            {activeTab === "overview" && (
              <div className="space-y-12">
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded">
              <h3 className="font-bold uppercase tracking-wide mb-4 text-xs text-corporate-navy border-b border-slate-200 pb-2 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Data Source
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {depot.source || "Navy Depot Induction Announcements"}
              </p>
            </div>
          </div>
        </div>

        {/* Functional Relationship Tree Map — full width, FIRST */}
        {activeTab === "overview" && (
          <div className="mt-12" id="contacts-map">
            <SectionHeader
              title="Functional Relationship Map"
              subtitle="Visualize program ownership, sustainment execution, contracting, and workload signals for this depot node."
            />
            <FunctionalTreeMap
              rootLabel="FRCE"
              rootSubtitle="Fleet Readiness Center East — MCAS Cherry Point"
              rootImage={`${import.meta.env.BASE_URL}FRCE.png`}
              rootChildren={[
                {
                  label: "CH-53K King Stallion",
                  image: "ch-53k.jpg",
                  
                  evidenceLevel: "Public/DoD",
                  lanes: [
                    {
                      title: "Program Ownership",
                      icon: <Shield className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "Authoritative",
                      defaultOpen: true,
                      nodes: [
                        {
                          label: "PEO(A)",
                          image: "PEO(A).png",
                          subtitle: "Program Executive Office, Air",
                          evidenceLevel: "Authoritative",
                          children: [
                            {
                              label: "PMA-261",
                              image: "pma_261.png",
                              subtitle: "Heavy Lift Helicopters Program Office",
                              evidenceLevel: "Authoritative",
                              evidenceDetails: [
                                {
                                  level: "Authoritative",
                                  text: "PMA-261 manages cradle-to-grave procurement, development, support, fielding, and disposal of the H-53 family.",
                                  source: "NAVAIR PMA-261 org page",
                                },
                                {
                                  level: "Public/DoD",
                                  text: "CH-53K AEPD induction at FRCE followed years of coordination between FRCE, Fleet Support Team, PMA-261, and USMC.",
                                  source: "DVIDS / FRCE release",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      title: "Sustainment Execution",
                      icon: <Wrench className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "Public/DoD",
                      defaultOpen: true,
                      nodes: [
                        {
                          label: "FRCE",
                          image: "FRCE.png",
                          subtitle: "Fleet Readiness Center East, MCAS Cherry Point",
                          evidenceLevel: "Public/DoD",
                          children: [
                            {
                              label: "COMFRC",
                              subtitle: "Commander, Fleet Readiness Centers",
                              evidenceLevel: "Authoritative",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      title: "Contracting Offices",
                      icon: <FileText className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "Observed",
                      defaultOpen: true,
                      nodes: [
                        {
                          label: "NAVAIR Pax River",
                          image: "NAVAIR Pax River.jpg",
                          subtitle: "Observed contracting activity (associated with CH-53K-related awards)",
                          evidenceLevel: "Observed",
                        },
                        {
                          label: "NAWCAD Lakehurst",
                          image: "NAWCAD Lakehurst.jpg",
                          subtitle: "Observed contracting activity — support equipment & auxiliary systems",
                          evidenceLevel: "Observed",
                        },
                        {
                          label: "DLA Aviation",
                          image: "DLA.svg",
                          subtitle: "Frequently observed (awards) — consumable parts & supply chain",
                          evidenceLevel: "Observed",
                        },
                      ],
                    },
                    {
                      title: "Workload Signal",
                      icon: <Radio className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "Public/DoD",
                      defaultOpen: true,
                      nodes: [
                        {
                          label: "14 CH-53K aircraft in AEPD",
                          subtitle: "Signal, not capacity — reflects announced depot inductions",
                          evidenceLevel: "Public/DoD",
                        },
                      ],
                    },
                    {
                      title: `Contacts${platformContacts["ch-53k"]?.length ? ` (${platformContacts["ch-53k"].length + 1})` : ""}`,
                      icon: <User className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "SME-validated" as const,
                      defaultOpen: true,
                      nodes: [
                        {
                          label: "Tahir Shah",
                          image: "Tahir_Shah.jpeg",
                          link: "https://www.linkedin.com/in/tahir-shah-86b87a13b",
                          subtitle: "SME-validated (internal). Public sources confirm NAVAIR Program Manager + CH-53K posts, but PMA-261 assignment not publicly confirmed.",
                          evidenceLevel: "SME-validated" as const,
                        },
                        ...(platformContacts["ch-53k"] || []).map((c: any) => ({
                          label: c.name,
                          subtitle: [c.title, c.organization].filter(Boolean).join(" — "),
                          link: c.email ? `/points-of-contact/${encodeURIComponent(c.email)}` : undefined,
                          evidenceLevel: "SME-validated" as const,
                        })),
                      ],
                    },
                  ],
                },
                {
                  label: "F-35 Lightning II",
                  image: "f-35.jpg",
                  
                  evidenceLevel: "Public/DoD",
                  lanes: [
                    {
                      title: "Program Ownership",
                      icon: <Shield className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "Authoritative",
                      defaultOpen: true,
                      nodes: [
                        {
                          label: "F-35 JPO",
                          image: "f35jpo.png",
                          subtitle: "F-35 Joint Program Office",
                          evidenceLevel: "Authoritative",
                        },
                      ],
                    },
                    ...(platformContacts["f-35"]?.length ? [{
                      title: `Contacts (${platformContacts["f-35"].length})`,
                      icon: <User className="h-3.5 w-3.5 text-primary" />,
                      evidenceLevel: "SME-validated" as const,
                      defaultOpen: true,
                      nodes: platformContacts["f-35"].map((c: any) => ({
                        label: c.name,
                        subtitle: [c.title, c.organization].filter(Boolean).join(" — "),
                        link: c.email ? `/points-of-contact/${encodeURIComponent(c.email)}` : undefined,
                        evidenceLevel: "SME-validated" as const,
                      })),
                    }] : []),
                  ],
                },
              ]}
            />
          </div>
        )}

        {/* Supported Platforms — below the map */}
        {activeTab === "overview" && (
          <div className="mt-12">
            <SectionHeader title="Supported Platforms" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {depot.platforms.map((p) => (
                <WeaponPlatformCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category}
                  description={p.description}
                  contractors={p.contractors}
                  imagePath={`${import.meta.env.BASE_URL}${p.id}.jpg`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepotDetail;
