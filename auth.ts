import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "@/auth.config";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { encrypt } from "@/lib/crypto";

const base = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

// Encrypt OAuth tokens at rest before they hit the accounts table.
const adapter: Adapter = {
  ...base,
  linkAccount(account) {
    return base.linkAccount!({
      ...account,
      access_token: account.access_token
        ? encrypt(account.access_token)
        : account.access_token,
      refresh_token: account.refresh_token
        ? encrypt(account.refresh_token)
        : account.refresh_token,
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: "jwt" },
});
