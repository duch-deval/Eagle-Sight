import supabase from "@/lib/supabaseClient";

// Full fetcher for Treemap / detailed views
export async function fetchAwardsByOffice(officeCode: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000; // Supabase max

  while (true) {
    const { data, error } = await supabase
        .from("awards")
        .select(`
            id,               
            award_id,
            award_date,
            recipient_name,
            awarded_amount,
            award_description,
            solicitation_id,
            set_aside_type,
            fsc,
            naics,
            funding_office_code,
            contract_pricing_type,
            pop_start_date,
            pop_end_date,
            offers_received,
            prepared_user,
            approved_by,
            last_modified_by
        `)

        .eq("funding_office_code", officeCode)
        .range(from, from + pageSize - 1);


    if (error) {
      console.error("❌ Supabase fetchAwardsByOffice error:", error);
      break;
    }
    if (!data || data.length === 0) break;

    allRows = allRows.concat(data);

    if (data.length < pageSize) break; // no more rows
    from += pageSize;
  }

  return allRows;
}

// Slimmed down fetcher for FundingChart (already fixed)
export async function fetchFundingByOffice(officeCode: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("awards")
      .select("award_id, award_date, awarded_amount, fsc, funding_office_code")
      .eq("funding_office_code", officeCode)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("❌ Supabase fetchFundingByOffice error:", error);
      break;
    }
    if (!data || data.length === 0) break;

    allRows = allRows.concat(data);

    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log("✅ FundingChart fetch complete", allRows.length);
  return allRows;
}
