import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, admin } from "better-auth/plugins";
import * as schema from "../src/db/schema";
import * as authSchema from "../src/db/auth-schema";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({ url: "file:local.db" });
const db = drizzle(client, { schema: { ...schema, ...authSchema } });

const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, minPasswordLength: 4 },
  plugins: [username(), admin({ defaultRole: "user" })],
});

async function main() {
  console.log("Fixing passwords...");

  try {
    const guruUser = await db.select().from(authSchema.user).where(eq(authSchema.user.username, "197601012005"));
    if (guruUser.length > 0) {
      await auth.api.setPassword({
        body: {
          newPassword: "guru1234",
          userId: guruUser[0].id,
        },
      });
      console.log("SUCCESS: Updated 197601012005 password to guru1234!");
    }
  } catch (e) {
    console.error("Error setting guru password:", e);
  }

  console.log("Password fix complete.");
}

main();
