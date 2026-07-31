"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

import { api, getErrorMessage } from "@/lib/axios";

export default function OrgSettingsPage() {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    country: "",
    phone: "",
  });

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.orgId) {
      setLoading(false);
      toast.error("Organization not found.");
      return;
    }

    const fetchOrg = async () => {
      try {
        console.log("Session:", session);

        const res = await api.get(`/orgs/${session.user.orgId}`);

        const org = res.data.org;

        console.log("Org:", org);

        setOrgId(org._id);

        setForm({
          name: org.name ?? "",
          description: org.description ?? "",
          city: org.address?.city ?? "",
          country: org.address?.country ?? "",
          phone: org.contact?.phone ?? "",
        });
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [status, session]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!orgId) {
      toast.error("Organization ID not found.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        description: form.description,
        address: {
          city: form.city,
          country: form.country,
        },
        contact: {
          phone: form.phone,
        },
      };

      console.log("Updating:", payload);

      const res = await api.patch(`/orgs/${orgId}`, payload);

      console.log(res.data);

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-muted">
        Loading clinic settings...
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">
        Clinic Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Clinic Name</span>
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">City</span>
            <input
              value={form.city}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Country</span>
            <input
              value={form.country}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  country: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Phone</span>
          <input
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
        </label>

        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          Save Changes
        </motion.button>
      </form>
    </div>
  );
}