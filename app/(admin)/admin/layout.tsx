"use client"

import { Sidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Building2, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orgs", label: "Clinics", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-6">
      <Sidebar title="Admin" links={links} />
      <div className="flex-1 py-8">{children}</div>
    </div>
  );
}