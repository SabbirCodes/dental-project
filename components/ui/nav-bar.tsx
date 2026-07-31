"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, LogOut, LayoutDashboard, TriangleAlert, Loader2 } from "lucide-react";
import { GiTooth } from "react-icons/gi";
import { useState, useEffect } from "react";

const roleHome: Record<string, string> = {
  user: "/dashboard",
  org: "/org",
  admin: "/admin",
  superadmin: "/superadmin",
};

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isAuthed = status === "authenticated" && !!session?.user;
  const dashboardHref = session?.user ? roleHome[session.user.role] ?? "/dashboard" : "/dashboard";

  useEffect(() => {
    if (confirmSignOut) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [confirmSignOut]);

  function openSignOutConfirm() {
    setOpen(false);
    setConfirmSignOut(true);
  }

  async function handleConfirmedSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <GiTooth className="text-primary" size={24} />
          BrightSmile
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/orgs" className="hover:text-primary transition-colors">
            Find a Clinic
          </Link>

          {isAuthed ? (
            <>
              <Link
                href={dashboardHref}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={openSignOutConfirm}
                className="flex items-center gap-1 text-muted hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary transition-colors">
                Log in
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </nav>

        {/* Mobile menu toggle — icon morphs between menu/close */}
        <button
          className="md:hidden relative h-8 w-8 flex items-center justify-center"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <motion.span
            animate={{ rotate: open ? 90 : 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </motion.span>
        </button>
      </div>

      {/* Mobile nav — animated open/close, not a hard conditional render */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <motion.nav
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
              className="px-4 py-3 flex flex-col gap-1 text-sm"
            >
              <motion.div variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                <Link
                  href="/orgs"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 hover:bg-background transition-colors"
                >
                  Find a Clinic
                </Link>
              </motion.div>

              {isAuthed ? (
                <>
                  <motion.div variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                    <Link
                      href={dashboardHref}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-background transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.button
                    variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                    onClick={openSignOutConfirm}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 hover:bg-background transition-colors"
                    >
                      Log in
                    </Link>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="mt-1 block rounded-lg bg-primary px-3 py-2.5 text-center font-medium text-primary-foreground"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign-out confirmation modal — shared by both desktop and mobile triggers */}
      <AnimatePresence>
        {confirmSignOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => !signingOut && setConfirmSignOut(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-surface p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <TriangleAlert size={18} />
                </span>
                <h2 className="font-medium text-lg">Sign out?</h2>
              </div>

              <p className="text-sm text-muted">
                You'll need to log in again to access your dashboard and bookings.
              </p>

              <div className="flex gap-2 pt-1">
                <motion.button
                  disabled={signingOut}
                  whileHover={{ scale: signingOut ? 1 : 1.02 }}
                  whileTap={{ scale: signingOut ? 1 : 0.97 }}
                  onClick={handleConfirmedSignOut}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {signingOut && <Loader2 className="animate-spin" size={16} />}
                  Sign out
                </motion.button>
                <motion.button
                  disabled={signingOut}
                  whileHover={{ scale: signingOut ? 1 : 1.02 }}
                  whileTap={{ scale: signingOut ? 1 : 0.97 }}
                  onClick={() => setConfirmSignOut(false)}
                  className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}