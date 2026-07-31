"use client"

import { Sidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, ShieldCheck, Users, Building2, Settings } from "lucide-react";

const links = [
  { href: "/superadmin", label: "Overview", icon: LayoutDashboard },
  { href: "/superadmin/admins", label: "Admins", icon: ShieldCheck },
  { href: "/superadmin/users", label: "Users", icon: Users },
  { href: "/superadmin/orgs", label: "Clinics", icon: Building2 },
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
];

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-6">
      <Sidebar title="Superadmin" links={links} />
      <div className="flex-1 py-8">{children}</div>
    </div>
  );
}
