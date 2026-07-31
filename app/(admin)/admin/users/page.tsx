"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: add a GET /api/admin/users route (mirroring the orgs pattern)
    // before wiring this up — left as a stub endpoint call so the page
    // is ready to go the moment that route exists.
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data.users))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Users</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted">No users found.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="rounded-lg border border-border bg-surface p-4 flex items-center gap-3">
              <UserRound className="text-primary" size={20} />
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted">
                  {u.email} · <span className="capitalize">{u.role}</span> · {u.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}