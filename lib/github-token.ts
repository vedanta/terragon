import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { decrypt } from "@/lib/crypto";

/** The current user's decrypted GitHub access token, or null. Server-only. */
export async function getGithubToken(userId: string): Promise<string | null> {
  const rows = await db
    .select({ token: accounts.access_token })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "github")))
    .limit(1);

  const enc = rows[0]?.token;
  return enc ? decrypt(enc) : null;
}
