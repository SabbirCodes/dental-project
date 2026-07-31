"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface PlatformConfigForm {
  siteName: string;
  supportEmail: string;
  requireOrgApproval: boolean;
  cancellationWindowHours: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultForm: PlatformConfigForm = {
  siteName: "",
  supportEmail: "",
  requireOrgApproval: true,
  cancellationWindowHours: "2",
  maintenanceMode: false,
  maintenanceMessage: "",
};

export default function SuperadminSettingsPage() {
  const [form, setForm] = useState<PlatformConfigForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/superadmin/settings")
      .then((res) => {
        const c = res.data.config;
        setForm({
          siteName: c.siteName ?? "",
          supportEmail: c.supportEmail ?? "",
          requireOrgApproval: !!c.requireOrgApproval,
          cancellationWindowHours: String(c.cancellationWindowHours ?? 2),
          maintenanceMode: !!c.maintenanceMode,
          maintenanceMessage: c.maintenanceMessage ?? "",
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/superadmin/settings", {
        siteName: form.siteName,
        supportEmail: form.supportEmail,
        requireOrgApproval: form.requireOrgApproval,
        cancellationWindowHours: Number(form.cancellationWindowHours),
        maintenanceMode: form.maintenanceMode,
        maintenanceMessage: form.maintenanceMessage || undefined,
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Platform Settings</h1>
      <p className="text-sm text-muted mb-6">
        These settings apply platform-wide and take effect immediately.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Site name</span>
          <input
            type="text"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Support email</span>
          <input
            type="email"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-border text-primary focus:ring-primary"
            checked={form.requireOrgApproval}
            onChange={(e) =>
              setForm({ ...form, requireOrgApproval: e.target.checked })
            }
          />
          Require admin approval before a clinic goes live
        </label>

        <div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Cancellation window (hours before appointment)
            </span>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              value={form.cancellationWindowHours}
              onChange={(e) =>
                setForm({ ...form, cancellationWindowHours: e.target.value })
              }
            />
          </label>
          <p className="text-xs text-muted mt-1">
            Patients can't cancel an appointment within this many hours of its
            start time. Enforced by the appointment cancellation API.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-border text-primary focus:ring-primary"
            checked={form.maintenanceMode}
            onChange={(e) =>
              setForm({ ...form, maintenanceMode: e.target.checked })
            }
          />
          Maintenance mode
        </label>

        {form.maintenanceMode && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Maintenance message</span>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              value={form.maintenanceMessage}
              onChange={(e) =>
                setForm({ ...form, maintenanceMessage: e.target.value })
              }
              placeholder="We're upgrading BrightSmile — back shortly."
            />
          </label>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.97 }}
          className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-primary text-primary-foreground"
          disabled={saving}
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          Save changes
        </motion.button>
      </form>
    </div>
  );
}
