export type PeriodPreset = "today" | "yesterday" | "this_week" | "this_month" | "custom";

export interface DashboardPeriod {
  preset: PeriodPreset;
  from: string;
  to: string;
}

export type DateRangeString = { from: string; to: string };
