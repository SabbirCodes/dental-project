"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({ title, links }: { title: string; links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 shrink-0 border-r border-border md:min-h-[calc(100vh-4rem)] px-3 py-6">
      <p className="px-3 mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="relative">
              <motion.div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-surface text-muted hover:text-foreground"
                }`}
                whileHover={{ x: active ? 0 : 2 }}
              >
                <Icon size={16} />
                {link.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
