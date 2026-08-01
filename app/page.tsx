"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  CalendarCheck,
  ShieldCheck,
  Search,
  ArrowRight,
  Quote,
} from "lucide-react";
import { GiTooth } from "react-icons/gi";
import { SmileUnderline } from "@/components/home/smile-underline";
import { Stat } from "@/components/home/stat";

const features = [
  {
    icon: Search,
    title: "Find dentists",
    text: "Browse trusted clinics near you, filtered by specialization and location.",
  },
  {
    icon: CalendarCheck,
    title: "Book online",
    text: "Pick an open slot and confirm in a few clicks — no phone calls.",
  },
  {
    icon: ShieldCheck,
    title: "Verified clinics",
    text: "Every clinic is reviewed by hand before it's allowed to take bookings.",
  },
];

const steps = [
  { title: "Search", text: "Find dentists by specialty, clinic, or location." },
  { title: "Choose", text: "Compare profiles, ratings, and open schedules." },
  {
    title: "Visit",
    text: "Book instantly and get your confirmation right away.",
  },
];

const testimonials = [
  {
    name: "Ayesha Rahman",
    review: "Booking my dentist took less than two minutes. Genuinely easy.",
  },
  {
    name: "Tanvir Hasan",
    review:
      "Found a specialist nearby with great reviews. Smooth experience end to end.",
  },
  {
    name: "Nusrat Jahan",
    review: "The appointment reminders meant I never missed a visit.",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Verified dentists" },
  { value: 20000, suffix: "+", label: "Appointments booked" },
  { value: 98, suffix: "%", label: "Patient satisfaction" },
];

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-16 top-8 -z-10 text-primary/6 hidden lg:block"
          >
            <GiTooth className="text-[380px]" />
          </motion.div>
        )}

        <div className="mx-auto max-w-3xl px-6 pt-24 pb-20 text-center sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted"
          >
            <GiTooth className="text-primary" size={14} />
            Trusted dental care, booked in minutes
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-6 text-4xl font-semibold leading-[1.1] sm:text-6xl"
          >
            Healthy smiles
            <br />
            start here.
          </motion.h1>

          <div className="mt-1 flex justify-center">
            <SmileUnderline />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted"
          >
            Discover trusted dentists, compare clinics, and book an appointment
            that fits your schedule — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/orgs"
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
              >
                Find a clinic
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <Link
              href="/about"
              className="group flex items-center gap-1 px-2 py-3 font-medium text-foreground"
            >
              About Us
              <span className="relative overflow-hidden">
                <ArrowRight
                  size={16}
                  className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mx-auto mt-20 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-10"
          >
            {stats.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Why BrightSmile
          </h2>
          <p className="mt-3 text-muted">
            Everything you need to find the right dentist.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="rounded-xl border border-border bg-surface p-7 transition-colors hover:border-primary/40"
            >
              <div className="mb-5 inline-flex rounded-lg bg-primary/10 p-3">
                <feature.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works — a real 3-step sequence, so numbering stays,
          kept small and connected rather than blown up as decoration. */}
      <section className="border-y border-border bg-surface/60 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Book in three simple steps
            </h2>
            <p className="mt-3 text-muted">
              No phone calls. No waiting rooms online.
            </p>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-4 hidden h-px bg-border md:block"
            />
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="relative z-10 mb-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-medium text-primary">
                  {i + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Loved by patients
          </h2>
          <p className="mt-3 text-muted">
            A few words from people who booked through BrightSmile.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="rounded-xl border border-border bg-surface p-7 transition-colors hover:border-primary/40"
            >
              <Quote className="text-primary/40" size={22} />
              <p className="mt-4 leading-7 text-muted">{item.review}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">BrightSmile patient</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground sm:px-14 sm:py-14"
        >
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready for a healthier smile?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80 sm:mt-4 sm:text-base">
            Browse verified dentists and book your first appointment today.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/orgs"
                className="block rounded-lg bg-white px-6 py-3 text-center font-medium text-primary"
              >
                Find a dentist
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="block rounded-lg border border-white/30 px-6 py-3 text-center font-medium transition-colors hover:bg-white/10"
              >
                Create account
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
