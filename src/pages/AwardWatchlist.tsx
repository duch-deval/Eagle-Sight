import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FolderOpen } from "lucide-react";
import supabase from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- helpers ---
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

const statusColors: Record<string, string> = {
  "1-14": "#ef4444",
  "15-29": "#d4592b",
  "30-44": "#eab308",
  "45-60": "#00b9ff",
  ">60": "#50af70",
  Ended: "#5b5b5bff",
};

function computePoP(start?: string, end?: string) {
  if (!start || !end) return { duration: "—", daysLeft: null, status: "Unknown" };
  const s = new Date(start),
    e = new Date(end),
    today = new Date();
  const duration = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.round((e.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let status = "Unknown";
  if (daysLeft < 0) status = "Ended";
  else if (daysLeft <= 14) status = "1-14";
  else if (daysLeft <= 29) status = "15-29";
  else if (daysLeft <= 44) status = "30-44";
  else if (daysLeft <= 60) status = "45-60";
  else status = ">60";
  return { duration, daysLeft, status };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const SortableHeader = ({ label, colKey, onSort }: any) => (
  <th
    onClick={() => onSort(colKey)}
    className="px-4 py-2 cursor-pointer select-none"
  >
    <div className="flex items-center gap-1">
      {label}
      <span className="text-xs">⇅</span>
    </div>
  </th>
);

const AwardWatchlist = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // fetch profiles + awards
  const loadProfilesWithAwards = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id, name, created_at,
        watchlist_awards (
          award_db_id,
          awards (
            id, award_id, award_date, award_description, recipient_name, 
            awarded_amount, solicitation_id, set_aside_type, fsc,
            pop_start_date, pop_end_date, offers_received
          )
        )
      `);

    if (error) {
      console.error("❌ error loading profiles with awards:", error);
      return;
    }

    const mapped = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      createdAt: p.created_at,
      awards: p.watchlist_awards
        .filter((w: any) => w.awards !== null)
        .map((w: any) => ({
          id: w.awards.id,
          "Award ID": w.awards.award_id,
          award_date: w.awards.award_date,
          "Award Description": w.awards.award_description,
          "Recipient Name": w.awards.recipient_name,
          "Awarded$": w.awards.awarded_amount,
          solicitation_id: w.awards.solicitation_id,
          set_aside_type: w.awards.set_aside_type,
          fsc: w.awards.fsc,
          pop_start_date: w.awards.pop_start_date,
          pop_end_date: w.awards.pop_end_date,
          offers_received: w.awards.offers_received,
        })),
    }));

    setProfiles(mapped);
  };

  useEffect(() => {
    loadProfilesWithAwards();
  }, []);

  const handleRemoveAward = async (profileId: string, awardDbId: number) => {
    const { error } = await supabase
      .from("watchlist_awards")
      .delete()
      .eq("profile_id", profileId)
      .eq("award_db_id", awardDbId);

    if (!error) {
      await loadProfilesWithAwards();
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev && prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const sortedAwards = React.useMemo(() => {
    if (!selectedProfile) return [];
    let rows = [...selectedProfile.awards];
    if (sortConfig) {
      rows.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return rows;
  }, [selectedProfile, sortConfig]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Award Watch list</h1>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" /> New Profile
        </Button>
      </div>

      {/* Profile Selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Choose a profile" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Profile Table */}
      {selectedProfile ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                {selectedProfile.name}
                <Badge variant="secondary">
                  {selectedProfile.awards.length} award
                  {selectedProfile.awards.length !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Created {formatDate(selectedProfile.createdAt)}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {selectedProfile.awards.length === 0 ? (
              <p className="text-muted-foreground text-sm">No awards in this profile yet.</p>
            ) : (
              <>
                {/* Search bar */}
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search Award ID, Solicitation ID, Description, or Recipient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs sm:text-sm border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Award ID</th>
                        <th className="px-4 py-2">Solicitation ID</th>
                        <SortableHeader label="Award Date" colKey="award_date" onSort={handleSort} />
                        <th className="px-4 py-2">Award Description</th>
                        <th className="px-4 py-2">Recipient</th>
                        <th className="px-4 py-2">Set Aside Type</th>
                        <th className="px-4 py-2">FSC</th>
                        <SortableHeader label="Awarded $" colKey="Awarded$" onSort={handleSort} />
                        <SortableHeader label="PoP Duration" colKey="PoP Duration" onSort={handleSort} />
                        <SortableHeader label="Days Till End" colKey="Days Till End" onSort={handleSort} />
                        <SortableHeader label="PoP Status" colKey="PoP Status" onSort={handleSort} />
                        <th className="px-4 py-2">Offers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAwards
                        .filter(
                          (a) =>
                            (a["Award ID"] || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (a["Award Description"] || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (a["Recipient Name"] || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((row: any, idx: number) => {
                          const { duration, daysLeft, status } = computePoP(
                            row.pop_start_date,
                            row.pop_end_date
                          );
                          const bgColor = statusColors[status] || "#ffffff";

                          return (
                            <tr
                              key={idx}
                              className="border-t hover:bg-accent cursor-pointer"
                              style={{ backgroundColor: bgColor, color: "white" }}
                              onDoubleClick={() => {
                                setSelectedAward(row);
                                setIsDialogOpen(true);
                              }}
                            >
                              <td className="px-4 py-2">{row["Award ID"]}</td>
                              <td className="px-4 py-2">{row.solicitation_id || "—"}</td>
                              <td className="px-4 py-2">
                                {row.award_date
                                  ? new Date(row.award_date).toLocaleDateString()
                                  : ""}
                              </td>
                              <td className="px-4 py-2">{row["Award Description"]}</td>
                              <td className="px-4 py-2">{row["Recipient Name"]}</td>
                              <td className="px-4 py-2">{row.set_aside_type || "—"}</td>
                              <td className="px-4 py-2">{row.fsc}</td>
                              <td className="px-4 py-2 text-right">
                                {formatCurrency(Number(row["Awarded$"]) || 0)}
                              </td>
                              <td className="px-4 py-2">{duration}</td>
                              <td className="px-4 py-2">
                                {daysLeft !== null ? daysLeft : "—"}
                              </td>
                              <td className="px-4 py-2">{status}</td>
                              <td className="px-4 py-2">{row.offers_received || "—"}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">Select a profile to view its awards.</p>
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Award?</DialogTitle>
          </DialogHeader>
          {selectedAward && (
            <div className="text-sm space-y-2">
              <p>
                Are you sure you want to remove{" "}
                <strong>{selectedAward["Award ID"]}</strong> from{" "}
                <strong>{selectedProfile?.name}</strong>’s profile?
              </p>
              <p className="text-muted-foreground">
                {selectedAward["Award Description"]}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProfileId && selectedAward) {
                  handleRemoveAward(selectedProfileId, selectedAward.id);
                }
                setIsDialogOpen(false);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AwardWatchlist;
