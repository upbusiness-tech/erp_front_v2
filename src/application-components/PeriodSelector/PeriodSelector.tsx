import { DatePicker, Segmented, Space, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { DashboardPeriod, PeriodPreset } from "@/types/dashboard";

const { RangePicker } = DatePicker;

const PRESET_OPTIONS: { label: string; value: PeriodPreset }[] = [
  { label: "Hoje", value: "today" },
  { label: "Ontem", value: "yesterday" },
  { label: "Semana", value: "this_week" },
  { label: "Mês", value: "this_month" },
  { label: "Personalizado", value: "custom" },
];

const MAX_RANGE_DAYS = 60;

interface PeriodSelectorProps {
  period: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  allowedPresets?: PeriodPreset[];
}

export function PeriodSelector({ period, onChange, allowedPresets }: PeriodSelectorProps) {
  const options = allowedPresets
    ? PRESET_OPTIONS.filter((o) => allowedPresets.includes(o.value))
    : PRESET_OPTIONS;

  const disabledDate = (current: Dayjs) => {
    if (current && current.isAfter(dayjs().endOf("day"))) return true;
    return current && current.isBefore(dayjs().subtract(MAX_RANGE_DAYS, "day").startOf("day"));
  };

  const handlePresetChange = (value: string | number) => {
    const next = value as PeriodPreset;
    onChange({ preset: next, from: period.from, to: period.to });
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) return;

    const [from, to] = dates;
    const diff = to.diff(from, "day");

    if (diff > MAX_RANGE_DAYS) {
      message.warning(`O período máximo permitido é de ${MAX_RANGE_DAYS} dias.`);
      return;
    }

    onChange({
      preset: "custom",
      from: from.format("YYYY-MM-DD"),
      to: to.format("YYYY-MM-DD"),
    });
  };

  const isCustom = period.preset === "custom";

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Segmented options={options} value={period.preset} onChange={handlePresetChange} />
      {isCustom && (
        <RangePicker
          value={[dayjs(period.from), dayjs(period.to)]}
          onChange={handleRangeChange as never}
          disabledDate={disabledDate}
          allowClear={false}
          format="DD/MM/YYYY"
          style={{ width: 280 }}
        />
      )}
    </Space>
  );
}
