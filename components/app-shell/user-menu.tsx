import { auth, signOut } from "@/auth";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export async function UserMenu() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-2">
      <span
        title={session.user.name ?? undefined}
        aria-label={session.user.name ?? "Account"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white"
      >
        {initials(session.user.name)}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="text-[13px] text-fg-muted hover:text-fg"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
