"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Star, Briefcase } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";
import { BookingWidget } from "@/components/booking/booking-widget";
import { StarRating } from "@/components/ui/star-rating";

interface Dentist {
  _id: string;
  name: string;
  bio?: string;
  specialization: string[];
  experienceYears?: number;
  rating: number;
  consultationFee?: number;
  orgId: { _id: string; name: string; slug: string };
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userId: { name: string };
}

export default function DentistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dentist, setDentist] = useState<Dentist | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/dentists/${id}`), api.get("/reviews", { params: { dentistId: id } })])
      .then(([dentistRes, reviewsRes]) => {
        setDentist(dentistRes.data.dentist);
        setReviews(reviewsRes.data.reviews);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted">Loading…</div>;
  if (!dentist) return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted">Dentist not found.</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 space-y-4"
      >
        <h1 className="text-2xl font-semibold">{dentist.name}</h1>
        <p className="text-sm text-muted">
          {dentist.orgId?.name} · {dentist.specialization.join(", ") || "General Dentistry"}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-primary">
            <Star size={14} fill="currentColor" /> {dentist.rating.toFixed(1)}
            <span className="text-muted">({reviews.length})</span>
          </span>
          {dentist.experienceYears != null && (
            <span className="flex items-center gap-1 text-muted">
              <Briefcase size={14} /> {dentist.experienceYears} yrs experience
            </span>
          )}
          {dentist.consultationFee != null && (
            <span className="text-muted">৳{dentist.consultationFee} consultation</span>
          )}
        </div>

        {dentist.bio && <p className="text-muted leading-relaxed">{dentist.bio}</p>}

        <div className="pt-6">
          <h2 className="font-medium mb-4">Patient reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{r.userId?.name ?? "Patient"}</p>
                    <StarRating value={r.rating} readOnly size={14} />
                  </div>
                  {r.comment && <p className="text-sm text-muted mt-1">{r.comment}</p>}
                  <p className="text-xs text-muted mt-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <BookingWidget dentistId={dentist._id} orgId={dentist.orgId._id} />
      </motion.div>
    </div>
  );
}
