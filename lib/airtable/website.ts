import Airtable, { FieldSet, Record } from "airtable";

export async function fetchWebsiteRecords(): Promise<Record<FieldSet>[]> {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(
      process.env.AIRTABLE_WEBSITE_BASE_ID!
    );

    const records: Record<FieldSet>[] = await base(
      process.env.AIRTABLE_WEBSITE_TABLE_NAME!
    )
      .select()
      .all();

    return records;
  } catch (error) {
    console.error("[airtable/website] Failed to fetch records:", error);
    return [];
  }
}
