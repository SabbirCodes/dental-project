"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Star, MapPin, Phone, Mail, Globe, BadgeCheck, Clock } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface Dentist {
  _id: string;
  name: string;
  specialization: string[];
  experienceYears?: number;
  rating: number;
  consultationFee?: number;
}

interface WorkingHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface Org {
  _id: string;
  name: string;
  description?: string;
  verified: boolean;
  address?: { city?: string; country?: string };
  contact?: { phone?: string; email?: string; website?: string };
  workingHours?: WorkingHours[];
}

export default function OrgDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<Org | null>(null);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orgs/${slug}`)
      .then((res) => {
        setOrg(res.data.org);
        setDentists(res.data.dentists);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted">Loading…</div>;
  if (!org) return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted">Clinic not found.</div>;

  const hasContact = org.contact?.phone || org.contact?.email || org.contact?.website;
  const workingHours = (org.workingHours ?? []).filter((w) => w.day);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 md:grid-cols-3"
      >
        {/* Clinic info */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{org.name}</h1>
            {org.verified && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <BadgeCheck size={13} />
                Verified
              </span>
            )}
          </div>

          {(org.address?.city || org.address?.country) && (
            <p className="flex items-center gap-1 text-sm text-muted mt-1.5">
              <MapPin size={14} />
              {[org.address?.city, org.address?.country].filter(Boolean).join(", ")}
            </p>
          )}

          {org.description && (
            <p className="text-muted mt-4 max-w-2xl leading-relaxed">{org.description}</p>
          )}

          {workingHours.length > 0 && (
            <div className="mt-6">
              <p className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <Clock size={14} className="text-primary" />
                Working hours
              </p>
              <div className="space-y-1 text-sm text-muted">
                {workingHours.map((w) => (
                  <div key={w.day} className="flex justify-between max-w-xs">
                    <span>{w.day}</span>
                    <span>{w.closed ? "Closed" : `${w.open} – ${w.close}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact card */}
        {hasContact && (
          <div className="rounded-lg border border-border bg-surface p-5 h-fit space-y-3">
            <p className="text-sm font-medium mb-1">Contact</p>
            {org.contact?.phone && (
              <a
                href={`tel:${org.contact.phone}`}
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
              >
                <Phone size={15} className="text-primary shrink-0" />
                {org.contact.phone}
              </a>
            )}
            {org.contact?.email && (
              <a
                href={`mailto:${org.contact.email}`}
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
              >
                <Mail size={15} className="text-primary shrink-0" />
                {org.contact.email}
              </a>
            )}
            {org.contact?.website && (
              <a
                href={org.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
              >
                <Globe size={15} className="text-primary shrink-0" />
                {org.contact.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}
      </motion.div>

      <h2 className="text-lg font-medium mt-10 mb-4">Dentists</h2>

      {dentists.length === 0 ? (
        <p className="text-sm text-muted">No dentists listed yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dentists.map((d, i) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
            >
              <Link href={`/dentists/${d._id}`}>
                <h3 className="font-medium">{d.name}</h3>
                <p className="text-xs text-muted mb-2">
                  {d.specialization.join(", ") || "General Dentistry"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-primary">
                    <Star size={14} fill="currentColor" /> {d.rating.toFixed(1)}
                  </span>
                  {d.consultationFee != null && <span>৳{d.consultationFee}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}