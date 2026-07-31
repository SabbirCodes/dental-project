"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/axios";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  dentistId: { name: string };
  orgId: { name: string };
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    api
      .get(`/appointments/${id}`)
      .then((res) => setAppointment(res.data.appointment))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [id]);

  if (!appointment) return <div className="mx-auto max-w-2xl px-4 py-12 text-sm text-muted">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Appointment Details</h1>
      <div className="rounded-lg border border-border bg-surface p-5 space-y-2 text-sm">
        <p><span className="text-muted">Dentist:</span> {appointment.dentistId?.name}</p>
        <p><span className="text-muted">Clinic:</span> {appointment.orgId?.name}</p>
        <p><span className="text-muted">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
        <p><span className="text-muted">Time:</span> {appointment.time}</p>
        <p><span className="text-muted">Status:</span> <span className="capitalize">{appointment.status}</span></p>
        {appointment.notes && <p><span className="text-muted">Notes:</span> {appointment.notes}</p>}
      </div>
    </div>
  );
}
