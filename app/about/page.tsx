"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2,
  ShieldCheck,
  Users,
  CalendarCheck,
  Clock,
  Award,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Partner Clinics", value: "150+", icon: Building2 },
  { label: "Verified Dentists", value: "500+", icon: Users },
  { label: "Appointments Booked", value: "25,000+", icon: CalendarCheck },
  { label: "Patient Satisfaction", value: "99%", icon: Award },
];

const values = [
  {
    icon: Clock,
    title: "Instant Scheduling",
    description:
      "Book appointments 24/7 without waiting on hold or dealing with busy phone lines.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description:
      "Every clinic and dentist on our platform undergoes rigorous credential verification.",
  },
  {
    icon: HeartHandshake,
    title: "Patient-Centered Care",
    description:
      "Transparent reviews, clear pricing, and flexible cancellation windows built around your needs.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface py-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4"
          >
            About Our Platform
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold sm:text-5xl lg:text-6xl max-w-3xl mx-auto"
          >
            Connecting Patients with Quality Dental Care Effortlessly
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            We are transforming how people manage their oral health by bridging
            the gap between dental clinics and patients through seamless
            real-time booking technology.
          </motion.p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 border-b border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center p-4 text-center rounded-xl bg-surface border border-border/60 shadow-sm"
                >
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary mb-3">
                    <Icon size={22} />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tight">
                Our Mission to Modernize Dental Scheduling
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Finding the right dentist and scheduling an appointment
                shouldn&apos;t be stressful. Our software empowers dental
                practices with modern management tools while giving patients an
                effortless, instant online booking experience.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you need a routine checkup, emergency care, or
                specialized dental treatments, our platform helps you find
                trusted professionals in your area within seconds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-4 sm:grid-cols-1"
            >
              {values.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="flex gap-4 p-5 rounded-xl border border-border bg-surface"
                  >
                    <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary h-fit">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {val.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-normal">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready for a Brighter Smile?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find qualified dentists near you and book your appointment in under
            2 minutes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/orgs">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Find a Clinic <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
