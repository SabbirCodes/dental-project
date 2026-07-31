"use client"
import { Sidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Stethoscope, CalendarClock, Settings } from "lucide-react";

const links = [
  { href: "/org", label: "Overview", icon: LayoutDashboard },
  { href: "/org/dentists", label: "Dentists", icon: Stethoscope },
  { href: "/org/appointments", label: "Appointments", icon: CalendarClock },
  { href: "/org/settings", label: "Settings", icon: Settings },
];

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-6">
      <Sidebar title="Clinic" links={links} />
      <div className="flex-1 py-8">{children}</div>
    </div>
  );
}
