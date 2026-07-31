"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, UserRound } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function SuperadminAdminsPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/superadmin/admins")
      .then((res) => setUsers(res.data.users))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAction(id: string, action: "promote" | "demote") {
    try {
      await api.patch(`/superadmin/admins/${id}`, { action });
      toast.success(
        action === "promote"
          ? "User promoted to admin"
          : "Admin access revoked",
      );
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Manage Admins</h1>
      <p className="text-sm text-muted mb-6">
        Promote a user to admin, or revoke admin access. Superadmin accounts
        can't be modified here.
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
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-3">
                <UserRound className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted">
                    {u.email} · <span className="capitalize">{u.role}</span>
                  </p>
                </div>
              </div>

              {u.role === "admin" ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAction(u._id, "demote")}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                >
                  <ShieldOff size={14} /> Revoke admin
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAction(u._id, "promote")}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <ShieldCheck size={14} /> Make admin
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
