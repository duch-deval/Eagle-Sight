import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Radio,
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

// NEW
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

const ContactDetail = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const decodedEmail = decodeURIComponent(email || "").trim().toLowerCase();
  const [rows, setRows] = useState<AwardRow[]>([]);
  const [loading, setLoading] = useState(true);
  // NEW
  const [samNotices, setSamNotices] = useState<SamNotice[]>([]);
  const [samLoading, setSamLoading] = useState(true);

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

    // NEW — fetch SAM notices for this contact
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
    fetchSamNotices(); // NEW
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

  if (loading) {
    return <div className="p-6"><p>Loading contact details...</p></div>;
  }

  if (!contactData.activities.length) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/points-of-contact")} className="mb-4">
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
      <Button variant="ghost" onClick={() => navigate("/points-of-contact")} className="mb-2">
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
                <span>Last Active: {contactData.lastActive.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Awards Table */}
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
                <Badge key={role} variant="secondary">{role}</Badge>
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
              <span className="text-2xl font-bold">{contactData.activities.length}</span>
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
              <span className="text-2xl font-bold">{contactData.agencies.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Offices */}
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
              <Badge key={office} variant="outline">{office}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NEW — SAM.gov Active Notices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-blue-500" />
            Active SAM.gov Notices
            <Badge variant="outline" className="ml-auto text-xs font-normal text-muted-foreground">
              Sourced from SAM.gov — opportunities only, not confirmed awards
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {samLoading ? (
            <p className="text-sm text-muted-foreground">Loading notices...</p>
          ) : samNotices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active SAM.gov notices found for this contact in the last 90 days.
            </p>
          ) : (
            <div className="space-y-3">
              {samNotices.map((notice) => (
                <div
                  key={notice.notice_id}
                  className="flex flex-col gap-1 p-3 rounded-md border bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm">{notice.opportunity_title}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
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
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {notice.published_date && <span>Published: {notice.published_date}</span>}
                    {notice.response_date && <span>Response Due: {notice.response_date}</span>}
                    <span className="font-mono text-muted-foreground/60">{notice.notice_id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {contactData.activities.map((activity, index) => (
              <div key={index} className="relative">
                {index !== contactData.activities.length - 1 && (
                  <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
                )}
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="h-6 w-6 rounded-full bg-navy/10 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-navy" />
                    </div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">
                        {activity.date.toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-xs">{activity.role}</Badge>
                    </div>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{activity.award["Award ID"]}</div>
                              <div className="text-sm text-muted-foreground">
                                {activity.award["Recipient Name"]}
                              </div>
                            </div>
                            <Badge variant="outline">
                              ${(activity.award["Awarded$"] / 1000).toFixed(0)}K
                            </Badge>
                          </div>
                          <Separator />
                          <div className="text-sm">
                            <span className="text-muted-foreground">Description: </span>
                            <span className="line-clamp-2">{activity.award["Award Description"]}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{activity.award["Funding Office Name"]}</span>
                            <span>•</span>
                            <span>{activity.award["Award Type"]}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactDetail;