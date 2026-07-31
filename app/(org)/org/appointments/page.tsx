"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: string;
  dentistId?: { name: string };
  userId?: { name: string; email: string };
}

export default function OrgAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/appointments")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.appointments ?? [];
        setAppointments(list);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/appointments/${id}`, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const cleanStr = dateStr.split("T")[0];
    const [year, month, day] = cleanStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Clinic Appointments</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse">Loading appointments…</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No appointments found for this clinic.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div
              key={a._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <CalendarClock size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Patient: {a.userId?.name ?? "Guest / Unspecified"}
                    {a.userId?.email && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({a.userId.email})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    with <strong className="text-foreground">{a.dentistId?.name ?? "Doctor"}</strong> · {formatDate(a.date)} at {a.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {a.status}
                </span>

                {a.status === "pending" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateStatus(a._id, "confirmed")}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Confirm
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateStatus(a._id, "cancelled")}
                      className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                    >
                      Reject
                    </motion.button>
                  </>
                )}

                {a.status === "confirmed" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => updateStatus(a._id, "completed")}
                    className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                  >
                    Mark Completed
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}