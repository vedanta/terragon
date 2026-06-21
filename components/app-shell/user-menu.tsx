import Image from "next/image";
import { auth, signOut } from "@/auth";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export async function UserMenu() {
  const session = await auth();
  if (!session?.user) return null;

  const name = session.user.name ?? undefined;

  return (
    <div className="flex items-center gap-2">
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt={name ?? "Account"}
          title={name}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      ) : (
        <span
          title={name}
          aria-label={name ?? "Account"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white"
        >
          {initials(session.user.name)}
        </span>
      )}
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
