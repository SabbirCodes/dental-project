"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Building2, Clock, Users } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ orgs: 0, pendingOrgs: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/orgs", { params: { all: true } }), api.get("/admin/users")])
      .then(([orgsRes, usersRes]) => {
        const orgs = orgsRes.data.orgs as { status: string }[];
        const users = usersRes.data.users as unknown[];
        setStats({
          orgs: orgs.length,
          pendingOrgs: orgs.filter((o) => o.status === "pending").length,
          users: users.length,
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Overview</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <Building2 className="text-primary mb-2" />
            <p className="text-2xl font-semibold">{stats.orgs}</p>
            <p className="text-sm text-muted">Total clinics</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <Clock className="text-primary mb-2" />
            <p className="text-2xl font-semibold">{stats.pendingOrgs}</p>
            <p className="text-sm text-muted">Pending approval</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="rounded-lg border border-border bg-surface p-5 shadow-sm"
          >
            <Users className="text-primary mb-2" />
            <p className="text-2xl font-semibold">{stats.users}</p>
            <p className="text-sm text-muted">Total users</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}