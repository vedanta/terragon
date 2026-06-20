import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { GitHubClient } from "@/lib/github/client";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

async function loadViewerLogin(): Promise<string | null> {
  if (USE_FIXTURES) return "maya"; // the prototype's "current user"
  const session = await auth();
  if (!session?.user) return null;
  const token = await getGithubToken(session.user.id);
  if (!token) return null;
  try {
    return await new GitHubClient({ token }).getViewerLogin();
  } catch {
    return null;
  }
}

/** Current user's GitHub login, memoized per request. */
export const getViewerLogin = cache(loadViewerLogin);
