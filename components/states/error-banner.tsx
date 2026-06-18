export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border px-3 py-2 text-[13px]"
      style={{
        borderColor: "color-mix(in srgb, var(--green) 0%, #e5484d 40%)",
        background: "#e5484d14",
        color: "#e5484d",
      }}
    >
      {message}
    </div>
  );
}
