import supabase from "@/lib/supabaseClient";

export interface RecipientRow {
  recipient_name: string;
  awarded_amount: number;
  fsc: string;
}

export async function fetchAllRecipientsWithFSC(): Promise<RecipientRow[]> {
  let allRows: RecipientRow[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("awards")
      .select("recipient_name, awarded_amount, fsc")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("❌ Supabase fetchAllRecipientsWithFSC error:", error);
      break;
    }
    if (!data || data.length === 0) break;

    allRows = allRows.concat(data as RecipientRow[]);

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}
