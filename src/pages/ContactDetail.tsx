import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import AwardTable from "@/components/AwardTable";
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Calendar,
  FileText,
  Shield,
  DollarSign,
} from "lucide-react";
import supabase from "@/lib/supabaseClient";

interface AwardRow {
  "Award ID": string;
  "Recipient Name": string;
  "Award Description": string;
  "Awarded$": number;
  "Award Date": string;
  "Funding Office Name": string;
  "Funding Agency": string;
  "Award Type": string;
  "Prepared_User": string | null;
  "Approved_By": string | null;
  "Last_Modified_By": string | null;
  "Last Modified Date": string;
  "Solicitation ID": string | null;
  "Set Aside Type": string | null;
  "FSC": string;
  "PoP Start Date": string;
  "PoP End Date": string;
  "Offers Received": string;
}

interface Activity {
  date: Date;
  role: string;
  award: AwardRow;
}

const ContactDetail = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const decodedEmail = decodeURIComponent(email || "").trim().toLowerCase();
  const [rows, setRows] = useState<AwardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactAwards = async () => {
      setLoading(true);

      // Get all award IDs for this contact from the three tables
      const [preparedRes, approvedRes, modifiedRes] = await Promise.all([
        supabase
          .from("prepared_user_contacts")
          .select("award_id")
          .eq("prepared_user", decodedEmail),
        supabase
          .from("approved_by_contacts")
          .select("award_id")
          .eq("approved_by", decodedEmail),
        supabase
          .from("last_modified_by_contacts")
          .select("award_id")
          .eq("last_modified_by", decodedEmail),
      ]);

      if (preparedRes.error || approvedRes.error || modifiedRes.error) {
        console.error("Error fetching contact awards:", preparedRes.error || approvedRes.error || modifiedRes.error);
        setLoading(false);
        return;
      }

      // Combine all award IDs (deduplicate)
      const awardIds = new Set<string>();
      preparedRes.data?.forEach(r => awardIds.add(r.award_id));
      approvedRes.data?.forEach(r => awardIds.add(r.award_id));
      modifiedRes.data?.forEach(r => awardIds.add(r.award_id));

      console.log(`âœ… Found ${awardIds.size} unique awards for ${decodedEmail}`);

      if (awardIds.size === 0) {
        setLoading(false);
        return;
      }

      // Fetch full award details for these award IDs
      const { data: awardsData, error: awardsError } = await supabase
        .from("awards")
        .select(`
          award_id,
          solicitation_id,
          solicitation_procedures,
          competition_type,
          offers_received,
          contract_pricing_type,
          set_aside_type,
          funding_office_name,
          fsc,
          naics,
          funding_agency,
          funding_sub_agency,
          award_type,
          pop_start_date,
          pop_end_date,
          last_modified_date,
          recipient_name,
          award_description,
          awarded_amount,
          prepared_user,
          approved_by,
          last_modified_by,
          award_date
        `)
        .in("award_id", Array.from(awardIds));

      if (awardsError) {
        console.error("Error fetching award details:", awardsError);
        setLoading(false);
        return;
      }

      console.log(`âœ… Loaded ${awardsData?.length} award details`);

      const mappedRows = awardsData.map((r: any) => ({
        "Award ID": r.award_id,
        "Solicitation ID": r.solicitation_id,
        "Award Date": r.award_date,
        "Award Description": r.award_description,
        "Recipient Name": r.recipient_name,
        "Set Aside Type": r.set_aside_type,
        "FSC": r.fsc,
        "Awarded$": Number(r.awarded_amount) || 0,
        "PoP Start Date": r.pop_start_date,
        "PoP End Date": r.pop_end_date,
        "Offers Received": r.offers_received,
        "Prepared_User": r.prepared_user?.trim().toLowerCase() ?? null,
        "Approved_By": r.approved_by?.trim().toLowerCase() ?? null,
        "Last_Modified_By": r.last_modified_by?.trim().toLowerCase() ?? null,
        "Funding Office Name": r.funding_office_name,
        "Funding Agency": r.funding_agency,
        "Award Type": r.award_type,
        "Last Modified Date": r.last_modified_date,
      }));

      setRows(mappedRows);
      setLoading(false);
    };

    fetchContactAwards();
  }, [decodedEmail]);

  const contactData = useMemo(() => {
    const activities: Activity[] = [];
    const roles = new Set<string>();
    const fundingOffices = new Set<string>();
    const agencies = new Set<string>();
    let totalValue = 0;

    rows.forEach((award) => {
      const emailFields = [
        { email: award.Prepared_User, role: "Prepared" },
        { email: award.Approved_By, role: "Approved" },
        { email: award.Last_Modified_By, role: "Modified" },
      ];

      emailFields.forEach(({ email: fieldEmail, role }) => {
        if (!fieldEmail || fieldEmail === "nan" || fieldEmail === "none") return;

        if (fieldEmail === decodedEmail) {
          roles.add(role);
          if (award["Funding Office Name"])
            fundingOffices.add(award["Funding Office Name"]);
          if (award["Funding Agency"]) agencies.add(award["Funding Agency"]);
          totalValue += award["Awarded$"];
          activities.push({
            date: new Date(award["Last Modified Date"] || award["Award Date"]),
            role,
            award,
          });
        }
      });
    });

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      roles: Array.from(roles),
      fundingOffices: Array.from(fundingOffices),
      agencies: Array.from(agencies),
      activities,
      totalValue,
      lastActive: activities[0]?.date,
    };
  }, [decodedEmail, rows]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading contact details...</p>
      </div>
    );
  }

  if (!contactData.activities.length) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/points-of-contact")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No data found for this contact.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/points-of-contact")}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        All Contacts
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-navy/10 flex items-center justify-center">
            <User className="h-8 w-8 text-navy" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {decodedEmail.split("@")[0].toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span>{decodedEmail}</span>
            </div>
            {contactData.lastActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Last Active: {contactData.lastActive.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awards Linked to This Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <AwardTable awards={rows} />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {contactData.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {contactData.activities.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${(contactData.totalValue / 1_000_000).toFixed(1)}M
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {contactData.agencies.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Funding Offices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {contactData.fundingOffices.map((office) => (
              <Badge key={office} variant="outline">
                {office}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Stream - Blackboard Style */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 text-white py-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-slate-50 dark:bg-slate-900">
          <div className="activity-stream">
            {(() => {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const yesterday = new Date(today.getTime() - 86400000);
              const lastWeek = new Date(today.getTime() - 7 * 86400000);
              const lastMonth = new Date(today.getTime() - 30 * 86400000);

              const groups: { title: string; items: typeof contactData.activities }[] = [];
              
              const todayItems = contactData.activities.filter(a => a.date >= today);
              const yesterdayItems = contactData.activities.filter(a => a.date >= yesterday && a.date < today);
              const lastWeekItems = contactData.activities.filter(a => a.date >= lastWeek && a.date < yesterday);
              const lastMonthItems = contactData.activities.filter(a => a.date >= lastMonth && a.date < lastWeek);
              const olderItems = contactData.activities.filter(a => a.date < lastMonth);

              if (todayItems.length) groups.push({ title: "Today", items: todayItems });
              if (yesterdayItems.length) groups.push({ title: "Yesterday", items: yesterdayItems });
              if (lastWeekItems.length) groups.push({ title: "Last 7 Days", items: lastWeekItems });
              if (lastMonthItems.length) groups.push({ title: "Last 30 Days", items: lastMonthItems });
              if (olderItems.length) groups.push({ title: "Older", items: olderItems });

              const getRoleIcon = (role: string) => {
                switch (role) {
                  case "Prepared":
                    return (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    );
                  case "Approved":
                    return (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                    );
                  case "Modified":
                    return (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    );
                  default:
                    return <FileText className="w-5 h-5" />;
                }
              };

              const getRoleColor = (role: string) => {
                switch (role) {
                  case "Prepared": return "bg-blue-500";
                  case "Approved": return "bg-emerald-500";
                  case "Modified": return "bg-amber-500";
                  default: return "bg-slate-500";
                }
              };

              return groups.map((group, groupIndex) => (
                <div key={groupIndex} className="activity-group">
                  <h2 className="activity-group-title px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                    {group.title}
                  </h2>
                  <ul className="activity-feed">
                    {group.items.map((activity, index) => (
                      <li key={index} className="stream-item-container border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                        <div className="stream-item bg-white dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer">
                          <div className="stream-item-contents flex">
                            {/* Left color strip */}
                            <div className={`w-1 flex-shrink-0 ${getRoleColor(activity.role)}`} />
                            
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-12 h-full flex items-start justify-center pt-4 ${getRoleColor(activity.role)} bg-opacity-10`}>
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getRoleColor(activity.role)} text-white shadow-sm`}>
                                {getRoleIcon(activity.role)}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="element-details flex-1 min-w-0 p-4">
                              {/* Top row: Timestamp + Role Badge */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="timestamp flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                  <span className="date font-medium">{activity.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span className="time">{activity.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold">
                                  {activity.role}
                                </Badge>
                              </div>

                              {/* Context - Office link */}
                              <div className="context text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline mb-1.5">
                                {activity.award["Funding Office Name"] || activity.award["Funding Agency"] || "Unknown Office"}
                              </div>

                              {/* Name/Title - Award ID */}
                              <div className="name text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                {activity.award["Award ID"]}
                              </div>

                              {/* Content/Description */}
                              <div className="content">
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                                  {activity.award["Award Description"]}
                                </p>
                                
                                {/* Meta info row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[200px]">{activity.award["Recipient Name"]}</span>
                                  </span>
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                                    ${(activity.award["Awarded$"] / 1000).toLocaleString()}K
                                  </span>
                                  {activity.award["Award Type"] && (
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-300 font-medium">
                                      {activity.award["Award Type"]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ));
            })()}
          </div>
          
          {/* Footer */}
          <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-5 py-3 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {contactData.activities.length} activities
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactDetail;