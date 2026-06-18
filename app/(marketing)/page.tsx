import Image from "next/image";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center text-fg">
      <div className="flex items-center gap-2">
        <Image
          src="/terragon.png"
          alt=""
          width={40}
          height={40}
          className="rounded-lg"
        />
        <span className="text-2xl font-semibold tracking-tight">Terragon</span>
      </div>
      <p className="max-w-md text-[15px] text-fg-muted">
        The calm execution layer for teams that live in GitHub. Turn Issues into
        a clean Kanban + grooming workspace — GitHub stays the source of truth.
      </p>
      <Link
        href="/board"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Open the board
      </Link>
    </main>
  );
}
