"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface SlotPickerProps {
  slots: string[];
  onSelect: (slot: string) => void;
  loading?: boolean;
}

export function SlotPicker({ slots, onSelect, loading }: SlotPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Clear internal selection whenever slots change (e.g., date changed)
  useEffect(() => {
    setSelected(null);
  }, [slots]);

  const handleSelect = (slot: string) => {
    setSelected(slot);
    onSelect(slot);
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading available time slots…</p>;
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center">
        <p className="text-sm font-medium">No slots available on this date.</p>
        <p className="text-xs text-muted mt-1">Please select another date above (e.g. Sunday).</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted">Available Time Slots:</p>
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      >
        {slots.map((slot) => (
          <motion.button
            key={slot}
            type="button"
            variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(slot)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              selected === slot
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-surface hover:border-primary/50"
            }`}
          >
            {slot}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}