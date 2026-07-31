"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { CalendarClock, X, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";
import { StarRating } from "@/components/ui/star-rating";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: string;
  reviewed: boolean;
  dentistId: { _id: string; name: string };
  orgId: { name: string; slug: string };
}

const statusColor: Record<string, string> = {
  pending: "text-amber-500",
  confirmed: "text-green-600",
  completed: "text-blue-600",
  cancelled: "text-red-500",
  "no-show": "text-red-500",
};

export default function UserDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/appointments")
      .then((res) => setAppointments(res.data.appointments))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancel(id: string) {
    try {
      await api.patch(`/appointments/${id}`, {
        status: "cancelled",
        cancelReason: "Cancelled by patient",
      });
      toast.success("Appointment cancelled");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function openReview(appointment: Appointment) {
    setReviewTarget(appointment);
    setRating(0);
    setComment("");
  }

  async function submitReview() {
    if (!reviewTarget || rating === 0) return;
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        appointmentId: reviewTarget._id,
        rating,
        comment: comment || undefined,
      });
      toast.success("Thanks for the review!");
      setReviewTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-muted">
          No appointments yet.{" "}
          <Link href="/orgs" className="text-primary underline">
            Find a clinic
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{a.dentistId?.name}</p>
                  <p className="text-sm text-muted">
                    {a.orgId?.name} · {new Date(a.date).toLocaleDateString()} at{" "}
                    {a.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm capitalize ${statusColor[a.status] ?? ""}`}
                >
                  {a.status}
                </span>
                {(a.status === "pending" || a.status === "confirmed") && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => cancel(a._id)}
                    className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors border border-border bg-transparent hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                )}
                {a.status === "completed" && !a.reviewed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openReview(a)}
                    className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Rate visit
                  </motion.button>
                )}
                {a.status === "completed" && a.reviewed && (
                  <span className="text-sm text-muted">Rated</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {reviewTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => !submitting && setReviewTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-surface p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">Rate your visit</h2>
                <button
                  onClick={() => setReviewTarget(null)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-muted">
                How was your appointment with {reviewTarget.dentistId?.name}?
              </p>

              <div className="flex justify-center py-2">
                <StarRating value={rating} onChange={setRating} size={32} />
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional — share more about your experience"
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />

              <motion.button
                whileHover={{ scale: rating === 0 || submitting ? 1 : 1.02 }}
                whileTap={{ scale: rating === 0 || submitting ? 1 : 0.97 }}
                disabled={rating === 0 || submitting}
                onClick={submitReview}
                className="w-full rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                Submit review
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
