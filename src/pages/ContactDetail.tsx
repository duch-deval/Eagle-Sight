import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import AwardTable from "@/components/AwardTable";
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Calendar,
  FileText,
  Shield,
  Radio,
  Clock,
  Award,
  Briefcase,
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

interface SamNotice {
  notice_id: string;
  opportunity_title: string;
  opportunity_type: string;
  contracting_office: string;
  psc: string | null;
  set_aside: string | null;
  response_date: string | null;
  published_date: string | null;
}

interface SimilarContact {
  email: string;
  total_awards: number;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "Today";
  if (diffDays < 7) return `${diffDays} Day${diffDays > 1 ? "s" : ""} Ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} Week${weeks > 1 ? "s" : ""} Ago`;
  }
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} Month${months > 1 ? "s" : ""} Ago`;
  const years = Math.floor(months / 12);
  return `${years} Year${years > 1 ? "s" : ""} Ago`;
}

const ContactDetail = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const decodedEmail = decodeURIComponent(email || "").trim().toLowerCase();
  const [rows, setRows] = useState<AwardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [samNotices, setSamNotices] = useState<SamNotice[]>([]);
  const [samLoading, setSamLoading] = useState(true);
  const [similarContacts, setSimilarContacts] = useState<SimilarContact[]>([]);

  useEffect(() => {
    const fetchContactAwards = async () => {
      setLoading(true);
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

      const awardIds = new Set<string>();
      preparedRes.data?.forEach(r => awardIds.add(r.award_id));
      approvedRes.data?.forEach(r => awardIds.add(r.award_id));
      modifiedRes.data?.forEach(r => awardIds.add(r.award_id));

      if (awardIds.size === 0) {
        setLoading(false);
        return;
      }

      const { data: awardsData, error: awardsError } = await supabase
        .from("awards")
        .select(`
          award_id, solicitation_id, solicitation_procedures, competition_type,
          offers_received, contract_pricing_type, set_aside_type, funding_office_name,
          fsc, naics, funding_agency, funding_sub_agency, award_type, pop_start_date,
          pop_end_date, last_modified_date, recipient_name, award_description,
          awarded_amount, prepared_user, approved_by, last_modified_by, award_date
        `)
        .in("award_id", Array.from(awardIds));

      if (awardsError) {
        console.error("Error fetching award details:", awardsError);
        setLoading(false);
        return;
      }

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

    const fetchSamNotices = async () => {
      setSamLoading(true);
      const { data, error } = await supabase
        .from("sam_notices")
        .select("notice_id, opportunity_title, opportunity_type, contracting_office, psc, set_aside, response_date, published_date")
        .eq("poc_email", decodedEmail)
        .order("published_date", { ascending: false })
        .limit(25);

      if (error) {
        console.error("Error fetching SAM notices:", error);
      } else {
        setSamNotices(data || []);
      }
      setSamLoading(false);
    };

    fetchContactAwards();
    fetchSamNotices();
  }, [decodedEmail]);

  // Fetch similar contacts from the same funding office
  useEffect(() => {
    if (contactData.fundingOffices.length === 0) return;
    const fetchSimilar = async () => {
      const { data, error } = await supabase
        .from("contact_summary")
        .select("email, total_awards")
        .contains("funding_offices", [contactData.fundingOffices[0]])
        .neq("email", decodedEmail)
        .order("total_awards", { ascending: false })
        .limit(5);
      if (!error && data) {
        setSimilarContacts(data.map(d => ({ email: d.email, total_awards: d.total_awards })));
      }
    };
    fetchSimilar();
  }, [rows]);

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
          if (award["Funding Office Name"]) fundingOffices.add(award["Funding Office Name"]);
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

  const contactName = decodedEmail
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const initials = contactName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-[280px] border-r border-border bg-sidebar p-6 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-96 mb-6" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (!contactData.activities.length && !samNotices.length) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/points-of-contact")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
        <div className="border border-border rounded-lg bg-card p-8 text-center">
          <p className="text-muted-foreground">No data found for this contact.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      {/* ─── LEFT SIDEBAR PANEL ─── */}
      <aside className="w-[280px] shrink-0 border-r border-border bg-sidebar flex flex-col overflow-y-auto">
        {/* Back button */}
        <div className="px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/points-of-contact")}
            className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground -ml-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            All Contacts
          </Button>
        </div>

        {/* Avatar + Name */}
        <div className="px-6 pt-4 pb-5 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-sidebar-foreground/20">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">{contactName}</h1>
          {contactData.lastActive && (
            <p className="text-xs text-sidebar-foreground/50 mt-1">
              Last Active {contactData.lastActive.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })}
            </p>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Metadata Fields */}
        <div className="px-5 py-4 space-y-4 text-sm">
          <MetadataField icon={Building2} label="Organization" value={contactData.agencies[0] || "Not listed"} />
          <MetadataField icon={Shield} label="Contact Types" value="Federal" />
          <MetadataField icon={Mail} label="Email" value={decodedEmail} mono />
          <MetadataField
            icon={Briefcase}
            label="Role"
            value={contactData.roles.length > 0 ? contactData.roles.join(", ") : "Not listed"}
          />
          <MetadataField
            icon={Building2}
            label="Funding Office"
            value={contactData.fundingOffices[0] || "Not listed"}
          />
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Stat Pills */}
        <div className="px-5 py-4 space-y-2">
          <div className="flex items-center justify-between rounded-md bg-sidebar-accent px-3 py-2">
            <span className="text-xs font-medium text-sidebar-foreground">Award POC</span>
            <Badge variant="default" className="text-xs px-2 py-0.5 min-w-[2rem] justify-center">
              {contactData.activities.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md bg-sidebar-accent px-3 py-2">
            <span className="text-xs font-medium text-sidebar-foreground">SAM.gov Notices</span>
            <Badge variant="default" className="text-xs px-2 py-0.5 min-w-[2rem] justify-center">
              {samNotices.length}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Similar Contacts */}
        <div className="px-5 py-4 flex-1">
          <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
            Similar Contacts
          </h3>
          {similarContacts.length > 0 ? (
            <div className="space-y-2">
              {similarContacts.map((sc) => {
                const scName = sc.email
                  .split("@")[0]
                  .replace(/[._]/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <button
                    key={sc.email}
                    onClick={() => navigate(`/points-of-contact/${encodeURIComponent(sc.email)}`)}
                    className="flex items-center gap-2 w-full text-left rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors group"
                  >
                    <div className="h-6 w-6 rounded-full bg-sidebar-accent flex items-center justify-center text-[10px] font-bold text-sidebar-foreground shrink-0">
                      {scName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-sidebar-foreground truncate group-hover:text-sidebar-primary transition-colors">
                        {scName}
                      </p>
                      <p className="text-[10px] text-sidebar-foreground/50">{sc.total_awards} awards</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-sidebar-foreground/50">No similar contacts found.</p>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="activity" className="flex flex-col h-full">
          {/* Tab Bar */}
          <div className="border-b border-border bg-card px-6 pt-2">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="awards"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
              >
                Federal Contract Awards
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{rows.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="sam"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
              >
                SAM.gov Notices
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{samNotices.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Activity Tab ── */}
          <TabsContent value="activity" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 max-w-4xl">
                {contactData.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No activity recorded.</p>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[72px] top-0 bottom-0 w-px bg-border" />

                    {contactData.activities.map((activity, index) => (
                      <div key={index} className="flex gap-4 mb-6 relative">
                        {/* Time label */}
                        <div className="w-[60px] shrink-0 pt-1 text-right">
                          <span className="text-xs text-muted-foreground font-medium">
                            {timeAgo(activity.date)}
                          </span>
                        </div>

                        {/* Dot */}
                        <div className="relative z-10 shrink-0 mt-1.5">
                          <div className="h-3 w-3 rounded-full bg-primary/80 ring-2 ring-background" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Seen as a Point of Contact for a Federal Contract Award
                          </p>
                          <div className="rounded-lg border border-border bg-card p-3.5 hover:bg-accent/30 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-primary truncate">
                                {activity.award["Award Description"]?.slice(0, 80) || activity.award["Award ID"]}
                              </span>
                              <Badge variant="outline" className="shrink-0 text-[10px]">
                                ${(activity.award["Awarded$"] / 1000).toFixed(0)}K
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {activity.award["Award Description"]
                                ? `This is a ${activity.award["Award Type"]?.toLowerCase() || "contract"} award to ${activity.award["Recipient Name"]}. ${activity.award["Award Description"].slice(0, 150)}...`
                                : `Award ${activity.award["Award ID"]} to ${activity.award["Recipient Name"]}`}
                            </p>
                            <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span>{activity.award["Funding Office Name"]}</span>
                              <span>•</span>
                              <span>{activity.award["Award Type"]}</span>
                              <span>•</span>
                              <span>{activity.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Awards Tab ── */}
          <TabsContent value="awards" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <AwardTable awards={rows} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── SAM.gov Tab ── */}
          <TabsContent value="sam" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 max-w-4xl space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Active SAM.gov Notices</span>
                  <Badge variant="outline" className="ml-auto text-[10px] text-muted-foreground">
                    Sourced from SAM.gov
                  </Badge>
                </div>

                {samLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : samNotices.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No active SAM.gov notices found for this contact.
                  </p>
                ) : (
                  samNotices.map((notice) => (
                    <div
                      key={notice.notice_id}
                      className="rounded-lg border border-border bg-card p-3.5 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-primary">
                          {notice.opportunity_title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {notice.opportunity_type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{notice.contracting_office}</span>
                        {notice.psc && <span>PSC: {notice.psc}</span>}
                        {notice.set_aside && notice.set_aside !== "No Set aside used" && (
                          <span>{notice.set_aside}</span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1.5 text-[10px] text-muted-foreground">
                        {notice.published_date && <span>Published: {notice.published_date}</span>}
                        {notice.response_date && <span>Response Due: {notice.response_date}</span>}
                        <span className="font-mono opacity-50">{notice.notice_id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

/* ─── Sidebar Metadata Field ─── */
function MetadataField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
        <span className={`text-xs text-sidebar-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</span>
      </div>
    </div>
  );
}

export default ContactDetail;
