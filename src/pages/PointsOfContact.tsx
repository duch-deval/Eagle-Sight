import { useState, useMemo, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";

interface ContactInfo {
  email: string;
  roles: Set<string>;
  awardCount: number;
  fundingOffices: string[];
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
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        
        while (true) {
          const { data, error } = await supabase
            .from("contact_summary")
            .select("email, roles, total_awards, funding_offices")  // ← Add funding_offices here
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Failed to load contacts:", error);
            setLoading(false);
            return;
          }

          if (!data || data.length === 0) break;
          
          allData = allData.concat(data);
          console.log(`📥 Loaded ${allData.length} contacts so far...`);
          
          if (data.length < batchSize) break; // Last batch
          from += batchSize;
        }

        const contactsArray = allData.map(row => ({
          email: row.email,
          roles: new Set<string>(row.roles as string[]),
          awardCount: row.total_awards,
          fundingOffices: row.funding_offices || []
        }));

        console.log(`✅ Loaded ${contactsArray.length} total unique contacts`);
        setContacts(contactsArray);
        setLoading(false);
      } catch (err) {
        console.error("Error loading contacts:", err);
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Points of Contact</h1>
          <p className="text-muted-foreground">
            View all contracting personnel and their related awards
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
              placeholder="Search by email..."
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
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
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
                      <TableCell className="text-right">{c.awardCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
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
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
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