"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Calendar, Clock, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/axios";

export interface IAvailability {
  day: string;
  slots: string[];
}

interface Dentist {
  _id: string;
  name: string;
  specialization?: string[];
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
  active: boolean;
  availability?: IAvailability[];
}

type DentistFormState = {
  name: string;
  specialization: string;
  experienceYears: string;
  consultationFee: string;
  bio: string;
  availability: IAvailability[];
};

const emptyForm: DentistFormState = {
  name: "",
  specialization: "",
  experienceYears: "",
  consultationFee: "",
  bio: "",
  availability: [],
};

function toPayload(form: DentistFormState) {
  return {
    name: form.name,
    specialization: form.specialization.split(",").map((s) => s.trim()).filter(Boolean),
    experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
    consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
    bio: form.bio || undefined,
    availability: form.availability,
  };
}

function toFormState(d: Dentist): DentistFormState {
  return {
    name: d.name,
    specialization: (d.specialization ?? []).join(", "),
    experienceYears: d.experienceYears?.toString() ?? "",
    consultationFee: d.consultationFee?.toString() ?? "",
    bio: d.bio ?? "",
    availability: d.availability ?? [],
  };
}

export default function OrgDentistsPage() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<DentistFormState>(emptyForm);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DentistFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [tempDay, setTempDay] = useState("");
  const [tempSlots, setTempSlots] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/dentists")
      .then((res) => setDentists(res.data.dentists))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const addAvailabilityItem = (
    formState: DentistFormState,
    setFormState: React.Dispatch<React.SetStateAction<DentistFormState>>
  ) => {
    if (!tempDay.trim()) {
      toast.error("Please enter a day (e.g., Monday or 2026-08-10)");
      return;
    }

    const slotsArray = tempSlots
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setFormState({
      ...formState,
      availability: [...formState.availability, { day: tempDay.trim(), slots: slotsArray }],
    });

    setTempDay("");
    setTempSlots("");
  };

  const removeAvailabilityItem = (
    index: number,
    formState: DentistFormState,
    setFormState: React.Dispatch<React.SetStateAction<DentistFormState>>
  ) => {
    setFormState({
      ...formState,
      availability: formState.availability.filter((_, i) => i !== index),
    });
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/dentists", toPayload(createForm));
      toast.success("Dentist added");
      setCreateForm(emptyForm);
      setShowCreateForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  function openEdit(d: Dentist) {
    setEditingId(d._id);
    setEditForm(toFormState(d));
  }

  function closeEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
    setTempDay("");
    setTempSlots("");
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      await api.patch(`/dentists/${editingId}`, toPayload(editForm));
      toast.success("Dentist updated");
      closeEdit();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await api.delete(`/dentists/${id}`);
      toast.success("Dentist deactivated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dentists</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus size={16} /> Add Dentist
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="overflow-hidden mb-6 rounded-lg border border-border bg-surface p-5 grid gap-3 sm:grid-cols-2"
          >
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">Specialization (comma separated)</span>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                value={createForm.specialization}
                onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">Experience (years)</span>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                value={createForm.experienceYears}
                onChange={(e) => setCreateForm({ ...createForm, experienceYears: e.target.value })}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">Consultation fee (৳)</span>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                value={createForm.consultationFee}
                onChange={(e) => setCreateForm({ ...createForm, consultationFee: e.target.value })}
              />
            </label>

            <div className="sm:col-span-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Bio</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                />
              </label>
            </div>

            <div className="sm:col-span-2 border-t border-border pt-3 mt-1">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Calendar size={15} /> Availability Schedule
              </p>
              <div className="flex gap-2 mb-2 items-end">
                <input
                  type="text"
                  placeholder="Day/Date (e.g. Monday or YYYY-MM-DD)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={tempDay}
                  onChange={(e) => setTempDay(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Slots (comma separated, e.g. 09:00, 10:00)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={tempSlots}
                  onChange={(e) => setTempSlots(e.target.value)}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addAvailabilityItem(createForm, setCreateForm)}
                  className="whitespace-nowrap rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                >
                  Add Slot
                </motion.button>
              </div>

              {createForm.availability.length > 0 && (
                <div className="space-y-1 mt-2">
                  {createForm.availability.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded border"
                    >
                      <span>
                        <strong>{item.day}:</strong> {(item.slots ?? []).join(", ") || "No slots specified"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAvailabilityItem(idx, createForm, setCreateForm)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <motion.button
                type="submit"
                disabled={creating}
                whileHover={{ scale: creating ? 1 : 1.02 }}
                whileTap={{ scale: creating ? 1 : 0.97 }}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating && <Loader2 className="animate-spin" size={16} />}
                Save Dentist
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : dentists.length === 0 ? (
        <p className="text-sm text-muted">No dentists yet — add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {dentists.map((d) => (
            <div
              key={d._id}
              className="rounded-lg border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-muted">
                  {(d.specialization ?? []).join(", ") || "General Dentistry"}
                  {!d.active && <span className="ml-2 text-red-500">(inactive)</span>}
                </p>

                {d.availability && d.availability.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {d.availability.map((a, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded text-foreground"
                      >
                        <Clock size={12} />
                        <strong>{a.day}:</strong> {(a.slots ?? []).join(", ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openEdit(d)}
                  className="rounded-lg border border-border bg-transparent p-2 hover:bg-background transition-colors"
                  aria-label="Edit dentist"
                >
                  <Pencil size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDeactivate(d._id)}
                  className="rounded-lg border border-border bg-transparent p-2 hover:bg-background transition-colors"
                  aria-label="Deactivate dentist"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={closeEdit}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleEditSave}
              className="w-full max-w-lg rounded-lg border border-border bg-surface p-5 space-y-3 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-medium text-lg">Edit Dentist</h2>
                <button type="button" onClick={closeEdit} className="text-muted hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium">Name</span>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium">Specialization (comma separated)</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Experience (years)</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    value={editForm.experienceYears}
                    onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Consultation fee (৳)</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    value={editForm.consultationFee}
                    onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })}
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium">Bio</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </label>

              <div className="border-t border-border pt-3 mt-1">
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Calendar size={15} /> Availability Schedule
                </p>
                <div className="flex gap-2 mb-2 items-end">
                  <input
                    type="text"
                    placeholder="Day/Date"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    value={tempDay}
                    onChange={(e) => setTempDay(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Slots (comma separated)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    value={tempSlots}
                    onChange={(e) => setTempSlots(e.target.value)}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addAvailabilityItem(editForm, setEditForm)}
                    className="whitespace-nowrap rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                  >
                    Add
                  </motion.button>
                </div>

                {editForm.availability.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {editForm.availability.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded border"
                      >
                        <span>
                          <strong>{item.day}:</strong> {(item.slots ?? []).join(", ") || "No slots specified"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAvailabilityItem(idx, editForm, setEditForm)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.97 }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  Save changes
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={closeEdit}
                  className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}