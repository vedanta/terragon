"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/prep", label: "Prep Station" },
  { href: "/board", label: "Board" },
  { href: "/grooming", label: "Grooming" },
  { href: "/milestones", label: "Milestones" },
  { href: "/my-work", label: "My Work" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border bg-subtle px-3 py-4">
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-sm font-semibold text-white">
          T
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          Terragon
        </span>
      </div>

      <nav className="flex flex-col gap-px">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "rounded-lg px-2.5 py-1.5 text-[13px] " +
                (active
                  ? "bg-accent-soft font-semibold text-accent-fg"
                  : "text-fg-muted hover:bg-hover")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
