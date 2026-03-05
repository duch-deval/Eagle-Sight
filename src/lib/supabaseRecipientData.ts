import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";

// ============================================
// Types
// ============================================
export interface Recipient {
  rank: number;
  name: string;
  total_awarded: number;
  award_count: number;
}

export interface FSCEntry {
  fsc_code: string;
  fsc_description: string;
  total_volume: number;
  top_recipients: Recipient[];
  deval: Recipient | null;
  partslife: Recipient | null;
}

// ============================================
// Hook: useFscLeaderboard
// ============================================
export function useFscLeaderboard(fiscalYear: number | null = null) {
  const [data, setData] = useState<FSCEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: result, error: rpcError } = await supabase.rpc(
          "get_fsc_leaderboard",
          fiscalYear ? { p_fiscal_year: fiscalYear } : {}
        );

        if (rpcError) {
          console.error("❌ FSC leaderboard RPC error:", rpcError);
          setError(rpcError.message);
          setData([]);
          return;
        }

        // RPC returns jsonb — Supabase client auto-parses it
        const parsed: FSCEntry[] = Array.isArray(result) ? result : [];
        setData(parsed);
      } catch (err: any) {
        console.error("❌ FSC leaderboard fetch error:", err);
        setError(err.message || "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fiscalYear]);

  return { data, loading, error };
}