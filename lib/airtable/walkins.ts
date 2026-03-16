import Airtable, { FieldSet, Record } from "airtable";

export async function fetchWalkinsRecords(): Promise<Record<FieldSet>[]> {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(
      process.env.AIRTABLE_WALKINS_BASE_ID!
    );

    const records: Record<FieldSet>[] = await base(
      process.env.AIRTABLE_WALKINS_TABLE_NAME!
    )
      .select()
      .all();

    return records;
  } catch (error) {
    console.error("[airtable/walkins] Failed to fetch records:", error);
    return [];
  }
}
