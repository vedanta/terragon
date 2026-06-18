import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center text-fg">
      <div className="flex items-center gap-2">
        <Image
          src="/terragon.png"
          alt=""
          width={40}
          height={40}
          className="rounded-lg"
        />
        <span className="text-xl font-semibold tracking-tight">Terragon</span>
      </div>
      <button
        type="button"
        className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg hover:bg-hover"
      >
        Continue with GitHub
      </button>
      <p className="text-[13px] text-fg-subtle">
        Authentication arrives in G3.
      </p>
    </main>
  );
}
