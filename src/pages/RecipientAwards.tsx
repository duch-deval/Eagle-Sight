import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/TacticalComponents";
import AwardTable from "@/components/AwardTable";
import supabase from "@/lib/supabaseClient";

function getFiscalYearRange(fy: number) {
  return {
    start: `${fy - 1}-10-01`,
    end: `${fy}-09-30`,
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const RecipientAwards = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const recipient = searchParams.get("recipient") || "";
  const fyParam = searchParams.get("fy");
  const fiscalYear = fyParam ? parseInt(fyParam, 10) : null;

  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipient) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("awards")
          .select("*")
          .eq("recipient_name", recipient)

        if (fiscalYear) {
          const { start, end } = getFiscalYearRange(fiscalYear);
          query = query.gte("award_date", start).lte("award_date", end);
        }

        query = query.order("awarded_amount", { ascending: false }).limit(5000);

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("❌ Error fetching recipient awards:", fetchError);
          setError(fetchError.message);
          setAwards([]);
          return;
        }

        setAwards(data || []);
      } catch (err: any) {
        console.error("❌ Recipient awards fetch error:", err);
        setError(err.message || "Unknown error");
        setAwards([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [recipient, fiscalYear]);

  const totalValue = awards.reduce(
    (sum, a) => sum + (parseFloat(a.awarded_amount) || 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 flex flex-col h-screen gap-6">
      {/* Back button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <SectionHeader
        title={recipient || "Recipient Awards"}
        subtitle={
          fiscalYear
            ? `Awards for FY${fiscalYear}`
            : "All fiscal years"
        }
      />

      {/* Summary stats */}
      {!loading && !error && awards.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            <span>
              <span className="font-semibold text-foreground">{awards.length}</span> awards
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>
              Total: <span className="font-semibold text-foreground">{fmt(totalValue)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading awards…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16 text-destructive">
          Failed to load awards. Check console for details.
        </div>
      )}

      {/* No recipient */}
      {!recipient && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          No recipient specified.
        </div>
      )}

      {/* No results */}
      {!loading && !error && recipient && awards.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No awards found for "<span className="font-semibold">{recipient}</span>"
          {fiscalYear && ` in FY${fiscalYear}`}.
        </div>
      )}

      {/* Award Table */}
      {!loading && !error && awards.length > 0 && (
        <div className="flex-1 min-h-0">
          <AwardTable awards={awards} />
        </div>
      )}
    </div>
  );
};

export default RecipientAwards;