import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({ url: "file:local.db" });

async function sync() {
  console.log("Syncing database schema for mading_posts...");

  try {
    const tableInfo = await client.execute("PRAGMA table_info(mading_posts)");
    console.log("Existing columns:", tableInfo.rows.map((r) => r.name));

    const colNames = new Set(tableInfo.rows.map((r) => String(r.name)));

    if (!colNames.has("tanggal_expired")) {
      console.log("Adding column tanggal_expired to mading_posts...");
      await client.execute("ALTER TABLE mading_posts ADD COLUMN tanggal_expired TEXT");
    }

    if (!colNames.has("image_url")) {
      console.log("Adding column image_url to mading_posts...");
      await client.execute("ALTER TABLE mading_posts ADD COLUMN image_url TEXT");
    }

    console.log("Schema sync complete!");
  } catch (e) {
    console.error("Error syncing schema:", e);
  }
}

sync();
