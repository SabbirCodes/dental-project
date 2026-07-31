"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Users, CalendarClock, Stethoscope } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

export default function OrgOverviewPage() {
  const [stats, setStats] = useState({ dentists: 0, appointments: 0, pending: 0 });

  useEffect(() => {
    Promise.all([api.get("/dentists"), api.get("/appointments")])
      .then(([dentistsRes, appointmentsRes]) => {
        const appointments = appointmentsRes.data.appointments as { status: string }[];
        setStats({
          dentists: dentistsRes.data.dentists.length,
          appointments: appointments.length,
          pending: appointments.filter((a) => a.status === "pending").length,
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Clinic Overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          <Stethoscope className="text-primary mb-2" />
          <p className="text-2xl font-semibold">{stats.dentists}</p>
          <p className="text-sm text-muted">Dentists</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          <CalendarClock className="text-primary mb-2" />
          <p className="text-2xl font-semibold">{stats.appointments}</p>
          <p className="text-sm text-muted">Total appointments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          <Users className="text-primary mb-2" />
          <p className="text-2xl font-semibold">{stats.pending}</p>
          <p className="text-sm text-muted">Pending requests</p>
        </motion.div>
      </div>
    </div>
  );
}