"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setLoading(false);
      toast.error(res.error);
      return;
    }

    const session = await getSession();
    setLoading(false);

    toast.success("Welcome back!");

    const role = session?.user?.role;
    let targetPath = "/dashboard";

    if (role === "admin") {
      targetPath = "/admin";
    } else if (role === "superadmin") {
      targetPath = "/superadmin";
    }

    router.push(targetPath);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            type="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <input
            type="password"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <motion.button
          type="submit"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          disabled={loading}
          className="w-full rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Log in
        </motion.button>

        <p className="text-sm text-muted text-center">
          No account?{" "}
          <a href="/register" className="text-primary underline">
            Register
          </a>
        </p>
      </motion.form>
    </div>
  );
}
