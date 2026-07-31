"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { CalendarDays, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";
import { SlotPicker } from "./slot-picker";

interface DateOption {
  isoDate: string; // e.g. "2026-08-02" or "2026-08-02T00:00:00.000Z"
  label: string;
}

// Helper function to extract YYYY-MM-DD cleanly
function formatYMD(dateInput: string): string {
  if (!dateInput) return "";
  return dateInput.split("T")[0]; // Converts "2026-08-02T00:00:00Z" -> "2026-08-02"
}

export function BookingWidget({
  dentistId,
  orgId,
}: {
  dentistId: string;
  orgId: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [upcomingDates, setUpcomingDates] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  // 1. Load upcoming available dates for this doctor
  useEffect(() => {
    setLoadingSchedule(true);
    api
      .get(`/dentists/${dentistId}/schedule`)
      .then((res) => {
        const rawDates: DateOption[] = res.data.upcomingDates ?? [];
        
        // Clean all isoDate values to YYYY-MM-DD
        const formattedDates = rawDates.map((d) => ({
          ...d,
          isoDate: formatYMD(d.isoDate),
        }));

        setUpcomingDates(formattedDates);
        if (formattedDates.length > 0) {
          setSelectedDate(formattedDates[0].isoDate); // Auto-select first upcoming date
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingSchedule(false));
  }, [dentistId]);

  // 2. Load slots when selected date changes
  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);

    const cleanDate = formatYMD(selectedDate);

    api
      .get(`/dentists/${dentistId}/slots`, { params: { date: cleanDate } })
      .then((res) => {
        if (!cancelled) {
          setSlots(res.data.slots ?? []);
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dentistId, selectedDate]);

  async function handleConfirm() {
    if (!session) {
      toast.info("Please log in to book an appointment.");
      router.push("/login");
      return;
    }
    if (!selectedSlot || !selectedDate) return;

    setBooking(true);
    try {
      await api.post("/appointments", {
        dentistId,
        orgId,
        date: formatYMD(selectedDate),
        time: selectedSlot,
      });
      toast.success("Appointment requested successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
      // Refresh slots on error
      const cleanDate = formatYMD(selectedDate);
      const res = await api.get(`/dentists/${dentistId}/slots`, { params: { date: cleanDate } });
      setSlots(res.data.slots ?? []);
      setSelectedSlot(null);
    } finally {
      setBooking(false);
    }
  }

  const confirmDisabled = !selectedSlot || !selectedDate;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 font-semibold text-base">
        <CalendarDays size={20} className="text-primary" />
        Available Doctor Dates
      </div>

      {loadingSchedule ? (
        <p className="text-xs text-muted">Loading doctor availability…</p>
      ) : upcomingDates.length === 0 ? (
        <p className="text-xs text-muted">No upcoming dates scheduled for this doctor.</p>
      ) : (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted">Select an Available Date:</span>

          {/* Quick Date Chips */}
          <div className="flex flex-wrap gap-2">
            {upcomingDates.map((d) => (
              <button
                key={d.isoDate}
                type="button"
                onClick={() => setSelectedDate(d.isoDate)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${
                  selectedDate === d.isoDate
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/50 text-foreground"
                }`}
              >
                {selectedDate === d.isoDate && <CheckCircle2 size={12} />}
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slots selection for chosen date */}
      {selectedDate && (
        <SlotPicker slots={slots} onSelect={setSelectedSlot} loading={slotsLoading} />
      )}

      {/* Confirmation */}
      <div className="space-y-2 pt-3 border-t border-border">
        {selectedSlot && (
          <div className="flex items-center gap-1.5 text-xs text-muted justify-center">
            <Clock size={13} />
            <span>
              Booking for: <strong className="text-foreground">{selectedSlot}</strong> on {selectedDate}
            </span>
          </div>
        )}

        <motion.button
          disabled={confirmDisabled || booking}
          whileHover={{ scale: confirmDisabled || booking ? 1 : 1.02 }}
          whileTap={{ scale: confirmDisabled || booking ? 1 : 0.97 }}
          onClick={handleConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {booking && <Loader2 className="animate-spin" size={16} />}
          {selectedSlot ? `Confirm Booking for ${selectedSlot}` : "Select a Time Slot"}
        </motion.button>
      </div>
    </div>
  );
}