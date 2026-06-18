import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Edge-safe Auth.js config — providers + callbacks only, NO adapter/db.
 * Used by `proxy.ts` for session checks and merged into the full `auth.ts`.
 */
export default {
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
