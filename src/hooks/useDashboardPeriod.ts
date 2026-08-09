import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { DashboardPeriod, PeriodPreset } from "@/types/dashboard";

function todayStr(): string {
  return dayjs().format("YYYY-MM-DD");
}

function yesterdayStr(): string {
  return dayjs().subtract(1, "day").format("YYYY-MM-DD");
}

function startOfWeekStr(): string {
  return dayjs().startOf("week").format("YYYY-MM-DD");
}

function startOfMonthStr(): string {
  return dayjs().startOf("month").format("YYYY-MM-DD");
}

const PRESET_DEFAULTS: Record<Exclude<PeriodPreset, "custom">, { from: string; to: string }> = {
  today: { from: todayStr(), to: todayStr() },
  yesterday: { from: yesterdayStr(), to: yesterdayStr() },
  this_week: { from: startOfWeekStr(), to: todayStr() },
  this_month: { from: startOfMonthStr(), to: todayStr() },
};

export function useDashboardPeriod(defaultPreset: PeriodPreset = "this_month") {
  const [preset, setPreset] = useState<PeriodPreset>(defaultPreset);
  const [customFrom, setCustomFrom] = useState<Dayjs | null>(null);
  const [customTo, setCustomTo] = useState<Dayjs | null>(null);

  const period = useMemo((): DashboardPeriod => {
    if (preset === "custom" && customFrom && customTo) {
      return {
        preset: "custom",
        from: customFrom.format("YYYY-MM-DD"),
        to: customTo.format("YYYY-MM-DD"),
      };
    }

    const defaultRange = PRESET_DEFAULTS[preset as Exclude<PeriodPreset, "custom">] ?? {
      from: todayStr(),
      to: todayStr(),
    };

    return { preset, ...defaultRange };
  }, [preset, customFrom, customTo]);

  const handleSetPreset = (next: PeriodPreset) => {
    setPreset(next);
    if (next !== "custom") {
      setCustomFrom(null);
      setCustomTo(null);
    }
  };

  const handleSetCustomRange = (from: Dayjs, to: Dayjs) => {
    setCustomFrom(from);
    setCustomTo(to);
  };

  return {
    preset,
    period,
    setPreset: handleSetPreset,
    setCustomRange: handleSetCustomRange,
  };
}
