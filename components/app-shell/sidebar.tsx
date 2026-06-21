"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Board" },
  { href: "/grooming", label: "Grooming" },
  { href: "/milestones", label: "Milestones" },
  { href: "/my-work", label: "My Work" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-border bg-subtle px-3 py-4 sm:flex">
      <div className="flex items-center gap-2 px-2">
        <Image
          src="/terragon.png"
          alt=""
          width={24}
          height={24}
          className="rounded-md"
        />
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
