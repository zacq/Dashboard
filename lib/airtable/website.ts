import Airtable, { FieldSet, Record, Records } from "airtable";

export async function fetchWebsiteRecords(): Promise<Records<FieldSet>> {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(
      process.env.AIRTABLE_WEBSITE_BASE_ID!
    );

    return await base(process.env.AIRTABLE_WEBSITE_TABLE_NAME!)
      .select()
      .all();
  } catch (error) {
    console.error("[airtable/website] Failed to fetch records:", error);
    return [] as unknown as Records<FieldSet>;
  }
}
