import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Building2,
  Shield,
  Truck,
  Factory,
  Loader2,
  Users,
  ExternalLink,
} from "lucide-react";
import { usePlatformById } from "@/hooks/usePlatforms";
import { CorporateButton, SectionHeader, CorporateCard } from "@/components/ui/TacticalComponents";
import { PlatformNews } from "@/components/dashboard/PlatformNews";
import DefenseBudgetBreakdown from "@/components/dashboard/DefenseBudgetBreakdown";
import { DepotMap } from "@/components/dashboard/DepotMap";

const WeaponPlatformDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllContacts, setShowAllContacts] = useState(false);

  // Fetch from Supabase
  const { platform: weapon, loading, error } = usePlatformById(id);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-corporate-blue" />
          <span className="text-slate-500">Loading platform data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Platform</h1>
          <p className="text-slate-500 mb-4">{error}</p>
          <CorporateButton onClick={() => navigate("/platforms")}>Return to Database</CorporateButton>
        </div>
      </div>
    );
  }

  // Not found state
  if (!weapon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-corporate-navy mb-4">Platform Not Found</h1>
          <CorporateButton onClick={() => navigate("/platforms")}>Return to Database</CorporateButton>
        </div>
      </div>
    );
  }

  const cleanText = (text?: string | number) => {
    if (!text) return "";
    return String(text).replace(/:contentReference\[.*?\]\{.*?\}/g, "").trim();
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* BREADCRUMB / TOP NAV */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="container mx-auto px-4 h-10 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <button
            onClick={() => navigate("/platforms")}
            className="flex items-center hover:text-corporate-blue transition-colors"
          >
            <ArrowLeft className="h-3 w-3 mr-2" /> Back to Platforms
          </button>
          <div className="flex gap-4">
            <span>{weapon.category}</span>
            <span className="text-slate-300">|</span>
            <span className="text-corporate-blue">{cleanText(weapon.name)}</span>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="relative bg-corporate-navy h-[320px] flex items-center border-b-4 border-corporate-blue">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/70 z-10"></div>
          <img
            src={`${import.meta.env.BASE_URL}${weapon.id}.jpg`}
            className="w-full h-full object-cover"
            alt={weapon.name}
            onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1574587020303-7d2a8622930b?q=80&w=2670")
            }
          />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-700 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                {weapon.status}
              </div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {weapon.category}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-none tracking-tight">
              {cleanText(weapon.name)}
            </h1>
          </div>
        </div>
      </div>

      {/* QUICK STATS BAR */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-300">
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                Prime Contractor
              </div>
              <div className="text-lg font-bold text-corporate-navy">
                {cleanText(weapon.contractors?.[0]) || "Unknown"}
              </div>
            </div>
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                Unit Cost
              </div>
              <div className="text-lg font-bold text-corporate-blue">
                {cleanText(weapon.unitCost) || "N/A"}
              </div>
            </div>
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                IOC
              </div>
              <div className="text-lg font-bold text-corporate-navy">
                {cleanText(weapon.ioc || weapon.firstDeployed || weapon.firstFlight) || "N/A"}
              </div>
            </div>
            <div className="px-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                Inventory
              </div>
              <div className="text-lg font-bold text-corporate-navy">
                {weapon.inventory || "N/A"}
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
                {["overview", "specifications", "sustainment", "budget", "news"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab
                      ? "border-corporate-blue text-corporate-blue"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-10">
                <div>
                  <SectionHeader title="Overview" />
                  <div className="prose prose-sm text-slate-600 max-w-none border-l-2 border-slate-200 pl-4">
                    <p className="mb-4">{cleanText(weapon.description)}</p>
                    {weapon.role && (
                      <p>
                        <strong>Role:</strong> {cleanText(weapon.role)}
                      </p>
                    )}
                    {weapon.service && (
                      <p>
                        <strong>Service:</strong> {cleanText(weapon.service)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="grid md:grid-cols-2 gap-6">
                  <CorporateCard className="p-6 bg-white border-slate-200">
                    <h3 className="text-sm font-bold text-corporate-navy mb-3 uppercase tracking-wide">
                      Capabilities
                    </h3>
                    <ul className="space-y-2">
                      {weapon.armament?.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 text-xs">
                          <div className="w-1.5 h-1.5 bg-corporate-blue mt-1.5 rounded-full flex-shrink-0" />
                          <span>{cleanText(item)}</span>
                        </li>
                      ))}
                      {weapon.engine && (
                        <li className="flex items-start gap-2 text-slate-600 text-xs">
                          <div className="w-1.5 h-1.5 bg-corporate-blue mt-1.5 rounded-full flex-shrink-0" />
                          <span>Powerplant: {cleanText(weapon.engine)}</span>
                        </li>
                      )}
                    </ul>
                  </CorporateCard>
                  <CorporateCard className="p-6 bg-white border-slate-200">
                    <h3 className="text-sm font-bold text-corporate-navy mb-3 uppercase tracking-wide">
                      Program Status
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-slate-600 text-xs">
                        <div className="w-1.5 h-1.5 bg-amber-500 mt-1.5 rounded-full flex-shrink-0" />
                        <span>Status: {weapon.status}</span>
                      </li>
                      {weapon.ioc && (
                        <li className="flex items-start gap-2 text-slate-600 text-xs">
                          <div className="w-1.5 h-1.5 bg-amber-500 mt-1.5 rounded-full flex-shrink-0" />
                          <span>IOC: {cleanText(weapon.ioc)}</span>
                        </li>
                      )}
                      {weapon.inventory && (
                        <li className="flex items-start gap-2 text-slate-600 text-xs">
                          <div className="w-1.5 h-1.5 bg-amber-500 mt-1.5 rounded-full flex-shrink-0" />
                          <span>Current Inventory: {weapon.inventory}</span>
                        </li>
                      )}
                    </ul>
                  </CorporateCard>
                </div>
              </div>
            )}

            {/* Tab Content: SPECIFICATIONS */}
            {activeTab === "specifications" && (
              <div>
                <SectionHeader title="Technical Specifications" />

                {weapon.performance && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Performance
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-sm">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {Object.entries(weapon.performance).map(([key, value], idx) => (
                            <tr key={key} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                              <td className="py-3 px-4 font-bold text-corporate-navy uppercase text-[10px] w-1/3 border-b border-slate-200 tracking-wider">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </td>
                              <td className="py-3 px-4 text-slate-600 border-b border-slate-200 font-mono text-xs">
                                {cleanText(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {weapon.dimensions && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Dimensions
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-sm">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {Object.entries(weapon.dimensions).map(([key, value], idx) => (
                            <tr key={key} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                              <td className="py-3 px-4 font-bold text-corporate-navy uppercase text-[10px] w-1/3 border-b border-slate-200 tracking-wider">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </td>
                              <td className="py-3 px-4 text-slate-600 border-b border-slate-200 font-mono text-xs">
                                {cleanText(value)}
                              </td>
                            </tr>
                          ))}
                          {weapon.crew && (
                            <tr className="bg-white">
                              <td className="py-3 px-4 font-bold text-corporate-navy uppercase text-[10px] w-1/3 border-b border-slate-200 tracking-wider">
                                Crew
                              </td>
                              <td className="py-3 px-4 text-slate-600 border-b border-slate-200 font-mono text-xs">
                                {cleanText(weapon.crew)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {weapon.armament && weapon.armament.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Armament
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {weapon.armament.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-slate-600 text-xs bg-slate-50 p-3 border border-slate-200"
                        >
                          <div className="w-1.5 h-1.5 bg-corporate-blue mt-1.5 rounded-full flex-shrink-0" />
                          <span>{cleanText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: SUSTAINMENT */}
            {activeTab === "sustainment" && (
              <div className="space-y-10">
                <div>
                  <SectionHeader title="Sustainment & Logistics" />

                  {/* Governance & Program Office */}
                  {weapon.programOffice && (
                    <div className="bg-slate-50 border-l-4 border-blue-500 p-5 mb-8">
                      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        Program Governance
                      </h3>
                      <p className="text-xs text-slate-600 mb-3">{cleanText(weapon.programOffice)}</p>
                      {weapon.governanceNotes && (
                        <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-3">
                          "{cleanText(weapon.governanceNotes)}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Depot Map */}
                  {weapon.depots && weapon.depots.length > 0 && (
                    <div className="mb-10">
                      <DepotMap depots={weapon.depots} />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Operating Bases */}
                    {weapon.operatingBases && weapon.operatingBases.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Primary Operating Bases
                        </h3>
                        <ul className="grid gap-1 max-h-64 overflow-y-auto">
                          {weapon.operatingBases.map((base, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-600 flex items-start gap-2"
                            >
                              <div className="w-1 h-1 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></div>
                              {base}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Supply Chain / Intermediaries */}
                    {weapon.intermediaries && weapon.intermediaries.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                          <Truck className="h-4 w-4" /> Supply Chain Nodes
                        </h3>
                        <ul className="space-y-3">
                          {weapon.intermediaries.map((node, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-600 border border-slate-100 p-2 rounded bg-slate-50/50"
                            >
                              {node}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Key Contacts Section */}
                  {weapon.keyContacts && weapon.keyContacts.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Users className="h-4 w-4" /> Program Contacts ({weapon.keyContacts.length})
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {weapon.keyContacts.slice(0, showAllContacts ? undefined : 6).map((contact, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 border border-slate-200 p-3 rounded-sm"
                          >
                            <div className="font-bold text-xs text-slate-800">{contact.name}</div>
                            {contact.title && (
                              <div className="text-[10px] text-slate-500">{contact.title}</div>
                            )}
                            {contact.organization && (
                              <div className="text-[10px] text-slate-400 mb-2">{contact.organization}</div>
                            )}

                            <div className="space-y-1 border-t border-slate-200 pt-2 mt-auto">
                              {contact.email && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <Mail className="h-3 w-3 text-corporate-blue flex-shrink-0" />
                                  <a href={`mailto:${contact.email}`} className="hover:text-corporate-blue hover:underline truncate">
                                    {contact.email}
                                  </a>
                                </div>
                              )}

                              {contact.phone && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <Phone className="h-3 w-3 text-corporate-blue flex-shrink-0" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}

                              {contact.email && (
                                <Link
                                  to={`/points-of-contact/${encodeURIComponent(contact.email)}`}
                                  className="text-[10px] text-corporate-blue hover:underline flex items-center gap-1 mt-1 font-medium"
                                >
                                  View Awards <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {weapon.keyContacts.length > 6 && (
                        <button
                          onClick={() => setShowAllContacts(!showAllContacts)}
                          className="text-[10px] text-corporate-blue hover:text-corporate-navy mt-3 font-bold uppercase tracking-wide flex items-center gap-1"
                        >
                          {showAllContacts
                            ? "Show Less"
                            : `+ ${weapon.keyContacts.length - 6} more contacts`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Accountability Summary */}
                  {weapon.accountabilitySummary && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        Accountability & Risks
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-3 border border-amber-100 rounded">
                        {cleanText(weapon.accountabilitySummary)}
                      </p>
                    </div>
                  )}

                  {/* Contracting Notes */}
                  {weapon.contractingNotes && (
                    <div className="mt-6">
                      <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        Contracting Vehicle Affinity
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed bg-blue-50 p-3 border border-blue-100 rounded">
                        {cleanText(weapon.contractingNotes)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content: NEWS */}
            {activeTab === "news" && (
              <div>
                <PlatformNews platformName={weapon.name} />
              </div>
            )}

            {/* Tab Content: BUDGET */}
            {activeTab === "budget" && (
              <div>
                <DefenseBudgetBreakdown
                  platformName={weapon.budgetKeyword || weapon.name}
                  hideSearch
                />
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Fleet Status Snapshot */}
            {weapon.fleetStatus && (
              <div className="bg-slate-800 text-white p-5 rounded-sm">
                <h3 className="font-bold uppercase tracking-wide mb-3 text-xs flex items-center gap-2 text-blue-400">
                  <Factory className="h-3 w-3" /> Fleet Snapshot
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-0">
                  {cleanText(weapon.fleetStatus)}
                </p>
              </div>
            )}

            {/* Lifecycle Summary */}
            {weapon.lifecycleSummary && (
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-sm">
                <h3 className="font-bold uppercase tracking-wide mb-3 text-xs text-blue-800 flex items-center gap-2">
                  <Shield className="h-3 w-3" /> Lifecycle Status
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  {cleanText(weapon.lifecycleSummary)}
                </p>
              </div>
            )}

            {/* POC Section */}
            {weapon.pointOfContact && (
              <div className="bg-white border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-corporate-navy uppercase tracking-wide mb-4 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Building2 className="h-3 w-3" /> Program Contact
                </h3>

                <div className="text-xs font-bold text-slate-800 mb-1">
                  {cleanText(weapon.pointOfContact.office)}
                </div>
                <div className="text-[10px] text-slate-500 uppercase mb-3">
                  {cleanText(weapon.pointOfContact.location)}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {weapon.pointOfContact.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="h-3 w-3 text-corporate-blue" />
                      <span>{cleanText(weapon.pointOfContact.phone)}</span>
                    </div>
                  )}
                  {weapon.pointOfContact.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="h-3 w-3 text-corporate-blue" />
                      <a
                        href={`mailto:${cleanText(weapon.pointOfContact.email)}`}
                        className="hover:underline hover:text-corporate-blue truncate"
                      >
                        {cleanText(weapon.pointOfContact.email)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contractors */}
            {weapon.contractors && weapon.contractors.length > 1 && (
              <div className="bg-slate-50 border border-slate-200 p-5">
                <h3 className="font-bold uppercase tracking-wide mb-4 text-xs text-corporate-navy border-b border-slate-200 pb-2">
                  OEM/Integrator/Contractors
                </h3>
                <ul className="space-y-2">
                  {weapon.contractors.map((contractor, i) => (
                    <li key={i} className="text-xs text-slate-600">
                      {contractor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active Variants */}
            {weapon.activeVariants && weapon.activeVariants.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 p-5">
                <h3 className="font-bold uppercase tracking-wide mb-4 text-xs text-corporate-navy border-b border-slate-200 pb-2">
                  Active Variants
                </h3>
                <div className="flex flex-wrap gap-2">
                  {weapon.activeVariants.map((variant, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white border border-slate-200 px-2 py-1 text-slate-600"
                    >
                      {variant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeaponPlatformDetail;