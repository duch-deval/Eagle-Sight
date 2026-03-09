import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, ChevronLeft, ChevronRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";

interface ContactInfo {
  email: string;
  roles: Set<string>;
  awardCount: number;
  fundingOffices: string[];
  lastSamActivity: Date | null;
}

function formatRelativeDate(date: Date | null): string {
  if (!date) return "—";
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays <= 7) return `${diffDays}d ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays <= 90) return `${Math.floor(diffDays / 30)}mo ago`;
  return "—";
}

const PointsOfContact = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 400;

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);

      try {
        const [contactsResult, samResult] = await Promise.all([
          (async () => {
            let allData: any[] = [];
            let from = 0;
            const batchSize = 1000;
            while (true) {
              const { data, error } = await supabase
                .from("contact_summary")
                .select("email, roles, total_awards, funding_offices")
                .range(from, from + batchSize - 1);
              if (error) throw error;
              if (!data || data.length === 0) break;
              allData = allData.concat(data);
              if (data.length < batchSize) break;
              from += batchSize;
            }
            return allData;
          })(),
          supabase
            .from("sam_notices")
            .select("poc_email, published_date")
            .order("loaded_at", { ascending: false }),
        ]);

        const contactRows: any[] = contactsResult as any[];
        const samRows: any[] = samResult.error ? [] : (samResult.data || []);

        const samActivityMap = new Map<string, Date>();
        for (const row of samRows) {
          if (!row.poc_email) continue;
          const emailKey = row.poc_email.toLowerCase();
          if (!samActivityMap.has(emailKey) && row.published_date) {
            const parsed = new Date(row.published_date);
            if (!isNaN(parsed.getTime())) {
              samActivityMap.set(emailKey, parsed);
            }
          }
        }

        const contactsArray: ContactInfo[] = contactRows.map(row => ({
          email: row.email,
          roles: new Set(row.roles),
          awardCount: row.total_awards,
          fundingOffices: row.funding_offices || [],
          lastSamActivity: samActivityMap.get(row.email?.toLowerCase()) || null,
        }));

        contactsArray.sort((a, b) => {
          if (a.lastSamActivity && b.lastSamActivity) {
            return b.lastSamActivity.getTime() - a.lastSamActivity.getTime();
          }
          if (a.lastSamActivity) return -1;
          if (b.lastSamActivity) return 1;
          return b.awardCount - a.awardCount;
        });

        console.log(`✅ Loaded ${contactsArray.length} contacts, ${samActivityMap.size} with SAM activity`);
        setContacts(contactsArray);
      } catch (err) {
        console.error("Error loading contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fundingOffices.some(office =>
        office.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [contacts, searchTerm]);

  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Points of Contact</h1>
          <p className="text-muted-foreground">
            Sorted by most recent SAM.gov activity
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <User className="h-4 w-4 mr-2" />
          {contacts.length} Contacts
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by email or funding office..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading contacts...</p>
          ) : filteredContacts.length === 0 ? (
            <p>No matching contacts found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Funding Offices</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Radio className="h-3.5 w-3.5 text-primary" />
                        SAM Activity
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Awards</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentContacts.map((c) => (
                    <TableRow
                      key={c.email}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/points-of-contact/${encodeURIComponent(c.email)}`)}
                    >
                      <TableCell className="font-medium">
                        <User className="h-4 w-4 text-muted-foreground inline mr-1" />
                        {c.email}
                      </TableCell>
                      <TableCell>
                        {Array.from(c.roles).map((r) => (
                          <Badge key={r} variant="secondary" className="mr-1 text-xs">
                            {r}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.fundingOffices.length > 0 ? (
                          <>
                            {c.fundingOffices.slice(0, 2).join(", ")}
                            {c.fundingOffices.length > 2 && (
                              <span className="text-muted-foreground">
                                {" "}+{c.fundingOffices.length - 2} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.lastSamActivity ? (
                          <span className="text-xs font-medium text-primary">
                            {formatRelativeDate(c.lastSamActivity)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{c.awardCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} contacts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsOfContact;