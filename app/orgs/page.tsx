"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, X, Building2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";
import { toast } from "sonner";

interface OrgListItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  address?: { city?: string; country?: string };
}

function OrgCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 animate-pulse">
      <div className="h-4 w-2/3 rounded bg-border/60 mb-3" />
      <div className="h-3 w-1/3 rounded bg-border/40 mb-3" />
      <div className="h-3 w-full rounded bg-border/40 mb-1.5" />
      <div className="h-3 w-4/5 rounded bg-border/40" />
    </div>
  );
}

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .get("/orgs", { params: debouncedQ ? { q: debouncedQ } : {}, signal: controller.signal })
      .then((res) => setOrgs(res.data.orgs))
      .catch((err) => {
        if (!controller.signal.aborted) toast.error(getErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-1">Find a Clinic</h1>
      <p className="text-sm text-muted mb-6">
        Browse verified dental clinics and book directly with a dentist.
      </p>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clinics by name..."
          className="w-full rounded-lg border border-border bg-surface pl-10 pr-9 py-2 text-sm outline-none focus:border-primary transition-colors"
        />
        <AnimatePresence>
          {q && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OrgCardSkeleton key={i} />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Building2 className="text-muted" size={28} />
          <p className="text-sm text-muted">
            {q ? `No clinics match "${q}".` : "No clinics found."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted">
            {orgs.length} clinic{orgs.length === 1 ? "" : "s"} found
          </p>
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {orgs.map((org) => (
              <motion.div
                key={org._id}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -2 }}
                className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <Link href={`/orgs/${org.slug}`}>
                  <h3 className="font-medium mb-1">{org.name}</h3>
                  {(org.address?.city || org.address?.country) && (
                    <p className="flex items-center gap-1 text-xs text-muted mb-2">
                      <MapPin size={12} />
                      {[org.address?.city, org.address?.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {org.description && (
                    <p className="text-sm text-muted line-clamp-2">{org.description}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}