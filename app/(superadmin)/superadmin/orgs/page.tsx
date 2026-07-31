"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Building2, Trash2, X, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface Org {
  _id: string;
  name: string;
  status: string;
  address?: { city?: string };
}

export default function SuperadminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Org | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/superadmin/orgs/${confirmTarget._id}`);
      const cascaded = res.data.cascaded as
        | { dentistsDeleted: number; appointmentsDeleted: number }
        | undefined;
      toast.success(
        cascaded
          ? `Clinic deleted (${cascaded.dentistsDeleted} dentist(s), ${cascaded.appointmentsDeleted} appointment(s) removed)`
          : "Clinic deleted"
      );
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Clinics</h1>
      <p className="text-sm text-muted mb-6">
        Approve, reject, or suspend clinics — or delete one permanently along
        with its dentists and appointments.
      </p>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : orgs.length === 0 ? (
        <p className="text-sm text-muted">No clinics found.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org, i) => (
            <motion.div
              key={org._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-3">
                <Building2 className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-muted capitalize">{org.status}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmTarget(org)}
                  aria-label="Delete clinic"
                  className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {confirmTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-lg border border-border bg-surface p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">Delete clinic?</h2>
                <button onClick={() => setConfirmTarget(null)} className="text-muted hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-muted">
                This will permanently delete <span className="font-medium">{confirmTarget.name}</span>,
                its dentists, and its appointments. The owner account will be
                kept but demoted back to a regular user. This can't be undone.
              </p>
              <div className="flex gap-2">
                <motion.button
                  disabled={deleting}
                  whileHover={{ scale: deleting ? 1 : 1.02 }}
                  whileTap={{ scale: deleting ? 1 : 0.97 }}
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting && <Loader2 className="animate-spin" size={16} />}
                  Delete permanently
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmTarget(null)}
                  className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}