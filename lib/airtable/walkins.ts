import Airtable, { FieldSet, Record, Records } from "airtable";

export async function fetchWalkinsRecords(): Promise<Records<FieldSet>> {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(
      process.env.AIRTABLE_WALKINS_BASE_ID!
    );

    return await base(process.env.AIRTABLE_WALKINS_TABLE_NAME!)
      .select()
      .all();
  } catch (error) {
    console.error("[airtable/walkins] Failed to fetch records:", error);
    return [] as unknown as Records<FieldSet>;
  }
}
