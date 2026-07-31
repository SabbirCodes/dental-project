"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface Org {
  _id: string;
  name: string;
  status: string;
  address?: { city?: string };
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/orgs", { params: { all: true } })
      .then((res) => setOrgs(res.data.orgs))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function act(id: string, action: "approve" | "reject" | "suspend") {
    try {
      await api.patch(`/admin/orgs/${id}/approve`, { action });
      toast.success(`Clinic ${action}d`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Clinics</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : orgs.length === 0 ? (
        <p className="text-sm text-muted">No clinics found.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org._id}
              className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-3">
                <Building2 className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-muted capitalize">{org.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {org.status !== "approved" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => act(org._id, "approve")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Approve
                  </motion.button>
                )}
                {org.status !== "rejected" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => act(org._id, "reject")}
                    className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                  >
                    Reject
                  </motion.button>
                )}
                {org.status === "approved" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => act(org._id, "suspend")}
                    className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                  >
                    Suspend
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