"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/prep", label: "Prep" },
  { href: "/board", label: "Board" },
  { href: "/grooming", label: "Grooming" },
  { href: "/milestones", label: "Milestones" },
  { href: "/my-work", label: "My Work" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-subtle px-2 py-2 sm:hidden">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "shrink-0 rounded-lg px-2.5 py-1 text-[13px] " +
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
  );
}
