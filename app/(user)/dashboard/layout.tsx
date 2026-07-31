"use client"
import { Sidebar } from "@/components/ui/sidebar";
import { LayoutDashboard } from "lucide-react";

const links = [
  { href: "/dashboard", label: "My Appointments", icon: LayoutDashboard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-6">
      <Sidebar title="Patient" links={links} />
      <div className="flex-1 py-8">{children}</div>
    </div>
  );
}
