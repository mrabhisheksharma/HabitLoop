import React, { useState, useEffect } from "react";
import { X, Check, Sparkles, Sliders } from "lucide-react";
import { Habit, TrackingType } from "../types";
import {
  EMOJI_CHOICES,
  CATEGORY_PRESETS,
  categoryColor,
  UNIT_PRESETS,
  HABIT_TEMPLATES,
  HabitTemplate,
} from "../constants";
import { useToast } from "./Toast";
import { triggerConfetti } from "../utils/confetti";
import { getUnitLabel } from "../utils/format";

interface Props {
  isOpen: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    icon: string;
    category: string;
    tracking_type: TrackingType;
    unit?: string;
    target_value: number | null;
    color: string;
    quick_increments?: number[];
  }) => void;
}

export function HabitFormModal({
  isOpen,
  habitToEdit,
  onClose,
  onSave,
}: Props) {
  const { show } = useToast();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(EMOJI_CHOICES[0]);
  const [category, setCategory] = useState("Health");
  const [customCategory, setCustomCategory] = useState("");
  const [trackingType, setTrackingType] = useState<TrackingType>("volume");
  const [unit, setUnit] = useState("ml");
  const [customUnit, setCustomUnit] = useState("");
  const [target, setTarget] = useState("2500");
  const [quickStepsStr, setQuickStepsStr] = useState("250, 500, 1000");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setIcon(habitToEdit.icon);
      setTrackingType(habitToEdit.tracking_type);
      setTarget(habitToEdit.target_value ? String(habitToEdit.target_value) : "");
      
      const currentUnit = habitToEdit.unit || getUnitLabel(habitToEdit);
      const isPreset = UNIT_PRESETS.some((p) => p.unit === currentUnit);
      if (isPreset) {
        setUnit(currentUnit);
        setCustomUnit("");
      } else {
        setUnit("custom");
        setCustomUnit(currentUnit);
      }

      if (habitToEdit.quick_increments && habitToEdit.quick_increments.length > 0) {
        setQuickStepsStr(habitToEdit.quick_increments.join(", "));
      } else {
        const preset = UNIT_PRESETS.find((p) => p.unit === currentUnit);
        setQuickStepsStr(preset ? preset.quickSteps.join(", ") : "1, 5, 10");
      }

      if (CATEGORY_PRESETS.includes(habitToEdit.category)) {
        setCategory(habitToEdit.category);
        setCustomCategory("");
      } else {
        setCategory("Custom");
        setCustomCategory(habitToEdit.category);
      }
    } else {
      // Default to Water Intake or clean state
      setName("");
      setIcon("💧");
      setTrackingType("volume");
      setUnit("ml");
      setCustomUnit("");
      setTarget("2500");
      setQuickStepsStr("250, 500, 1000");
      setCategory("Health");
      setCustomCategory("");
    }
    setError("");
    setShowAdvanced(false);
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const finalCategory =
    category === "Custom" ? customCategory.trim() || "Custom" : category;

  const finalUnit = unit === "custom" ? customUnit.trim() || "units" : unit;

  const handleApplyTemplate = (tmpl: HabitTemplate) => {
    setName(tmpl.name);
    setIcon(tmpl.icon);
    setCategory(tmpl.category);
    setTrackingType(tmpl.tracking_type);
    setUnit(tmpl.unit);
    setCustomUnit("");
    setTarget(String(tmpl.target_value));
    setQuickStepsStr(tmpl.quick_increments.join(", "));
    setError("");
    show(`Applied "${tmpl.name}" template`, "success");
  };

  const handleSelectUnitPreset = (presetUnit: string) => {
    setUnit(presetUnit);
    const matched = UNIT_PRESETS.find((p) => p.unit === presetUnit);
    if (matched) {
      setTrackingType(matched.tracking_type);
      setTarget(String(matched.defaultTarget));
      setQuickStepsStr(matched.quickSteps.join(", "));
    }
  };

  const parseQuickIncrements = (): number[] | undefined => {
    if (!quickStepsStr.trim()) return undefined;
    const parts = quickStepsStr
      .split(/[, ]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return parts.length > 0 ? parts : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a habit name");
      return;
    }

    const parsedTarget = parseFloat(target);
    const target_value =
      Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : null;

    onSave({
      name: name.trim(),
      icon,
      category: finalCategory,
      tracking_type: trackingType,
      unit: finalUnit,
      target_value,
      color: categoryColor(finalCategory),
      quick_increments: parseQuickIncrements(),
    });

    if (habitToEdit) {
      show(`${name.trim()} updated`, "success");
    } else {
      triggerConfetti();
      show(`${name.trim()} created! 🎉`, "success");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-pop overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E2E8F0] dark:border-[#334155] my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155] shrink-0">
          <div>
            <h2 className="font-display font-black text-2xl text-[#0F172A] dark:text-[#F8FAFC]">
              {habitToEdit ? "Edit Habit" : "Create Habit"}
            </h2>
            <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Custom measurements, quick-add buttons &amp; targets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-6 flex-1 pr-1 scrollbar-thin">
          {/* Quick templates section when creating new */}
          {!habitToEdit && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-display font-black text-xs uppercase tracking-wider text-[#6366F1] dark:text-[#818CF8]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Habit Templates
                </span>
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                  1-tap to populate
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1.5 bg-[#F1F5F9]/60 dark:bg-[#0F172A]/60 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] scrollbar-thin">
                {HABIT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-[#EEF2FF] dark:hover:bg-[#312E81]/50 border border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1] text-left transition-all group"
                  >
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {tmpl.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-black text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate">
                        {tmpl.target_value} {tmpl.unit}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block font-display font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Water Intake, Morning Run, Daily Reading"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-[#6366F1] focus:outline-none font-semibold text-base transition-colors"
            />
            {error && <p className="text-xs font-bold text-[#EF4444] mt-1.5">{error}</p>}
          </div>

          {/* Icon selector */}
          <div>
            <label className="block font-display font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mb-2">
              Choose an Icon
            </label>
            <div className="grid grid-cols-8 gap-2 bg-[#F1F5F9]/60 dark:bg-[#0F172A]/60 p-3 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                    icon === e
                      ? "bg-[#6366F1] text-white shadow-md scale-110"
                      : "bg-white dark:bg-[#1E293B] hover:bg-[#EEF2FF] dark:hover:bg-[#312E81]/40"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Measurement Unit Presets */}
          <div>
            <label className="block font-display font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mb-2">
              Measurement Unit
            </label>
            <div className="flex flex-wrap gap-2">
              {UNIT_PRESETS.map((p) => {
                const isSelected = unit === p.unit;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectUnitPreset(p.unit)}
                    className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs transition-all border ${
                      isSelected
                        ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs font-black"
                        : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setUnit("custom")}
                className={`px-3.5 py-2 rounded-xl font-display font-bold text-xs transition-all border ${
                  unit === "custom"
                    ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs font-black"
                    : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1]"
                }`}
              >
                Custom Unit...
              </button>
            </div>

            {unit === "custom" && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="e.g. liters, km, sets, items"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-[#6366F1] text-sm font-bold transition-colors"
                />
              </div>
            )}
          </div>

          {/* Target */}
          <div>
            <label className="block font-display font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mb-2">
              Daily Goal / Target <span className="font-normal text-xs text-[#64748B] dark:text-[#94A3B8]">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-[#6366F1] focus:outline-none font-extrabold text-base transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6366F1] dark:text-[#818CF8] uppercase">
                {finalUnit}
              </span>
            </div>
          </div>

          {/* Quick Increments Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-display font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                Quick-Add Stepper Buttons
              </label>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-[#6366F1] dark:text-[#818CF8] flex items-center gap-1 hover:underline"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showAdvanced ? "Hide settings" : "Customize increments"}
              </button>
            </div>

            {/* Preview of quick add buttons */}
            <div className="flex items-center gap-2 mb-2">
              {(parseQuickIncrements() || [1, 5, 10]).map((inc) => (
                <div
                  key={inc}
                  className="px-3 py-1.5 rounded-xl bg-[#EEF2FF] dark:bg-[#312E81]/50 text-[#4338CA] dark:text-[#A5B4FC] font-display font-black text-xs border border-[#6366F1]/20"
                >
                  +{inc} {finalUnit}
                </div>
              ))}
            </div>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-[#F1F5F9]/60 dark:bg-[#0F172A]/60 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                  Comma-separated increments (e.g. 250, 500, 1000):
                </label>
                <input
                  type="text"
                  value={quickStepsStr}
                  onChange={(e) => setQuickStepsStr(e.target.value)}
                  placeholder="250, 500, 1000"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold focus:border-[#6366F1]"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block font-display font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_PRESETS.map((c) => {
                const isSelected = category === c;
                const color = categoryColor(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full font-bold text-xs transition-all border ${
                      isSelected
                        ? "text-white shadow-xs font-black"
                        : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:border-current"
                    }`}
                    style={{
                      backgroundColor: isSelected ? color : undefined,
                      borderColor: isSelected ? color : undefined,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {category === "Custom" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type your custom category..."
                className="w-full mt-3 px-4 py-3 rounded-2xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-[#6366F1] focus:outline-none text-sm font-semibold transition-colors"
              />
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-base shadow-lg shadow-[#6366F1]/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Check className="w-5 h-5" />
              {habitToEdit ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
