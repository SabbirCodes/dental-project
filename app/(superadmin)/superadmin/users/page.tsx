"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { UserRound, Trash2, X, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function SuperadminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data.users))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/superadmin/users/${confirmTarget._id}`);
      const cascaded = res.data.cascaded as
        | {
            orgDeleted: boolean;
            dentistsDeleted: number;
            appointmentsDeleted: number;
          }
        | undefined;

      if (cascaded?.orgDeleted) {
        toast.success(
          `User and their clinic deleted (${cascaded.dentistsDeleted} dentist(s), ${cascaded.appointmentsDeleted} appointment(s) removed)`,
        );
      } else {
        toast.success("User deleted");
      }

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
      <h1 className="text-2xl font-semibold mb-2">Users</h1>
      <p className="text-sm text-muted mb-6">
        Deleting a clinic-owner account also removes their clinic, dentists, and
        appointments. Superadmin accounts can't be deleted here.
      </p>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted">No users found.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-3">
                <UserRound className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted">
                    {u.email} · <span className="capitalize">{u.role}</span> ·{" "}
                    {u.status}
                  </p>
                </div>
              </div>

              {u.role !== "superadmin" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmTarget(u)}
                  className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors border border-border bg-transparent hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> Delete
                </motion.button>
              )}
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
                <h2 className="font-medium text-lg">Delete user?</h2>
                <button
                  onClick={() => setConfirmTarget(null)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-muted">
                This will permanently delete{" "}
                <span className="font-medium">{confirmTarget.name}</span>
                {confirmTarget.role === "org" &&
                  " along with their clinic, its dentists, and its appointments"}
                . This can't be undone.
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: deleting ? 1 : 1.02 }}
                  whileTap={{ scale: deleting ? 1 : 0.97 }}
                  disabled={deleting}
                  onClick={handleDelete}
                  className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors border border-red-500 text-red-500 bg-transparent hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting && <Loader2 className="animate-spin" size={16} />}
                  Delete permanently
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmTarget(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors border border-border bg-transparent hover:bg-surface"
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
