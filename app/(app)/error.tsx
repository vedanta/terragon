"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-[14px] font-medium text-fg">Something went wrong</p>
      <p className="max-w-sm text-[13px] text-fg-subtle">
        An unexpected error occurred. This has been logged — try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
