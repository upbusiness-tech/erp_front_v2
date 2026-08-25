import type { InputProps } from "antd";
import { Input } from "antd";
import type { ChangeEvent } from "react";
import { useCallback } from "react";

type InputNumberFormattedProps = Omit<InputProps, "value" | "onChange" | "type"> & {
  value?: number;
  onChange?: (value: number) => void;
  precision?: number;
  suffix?: string;
};

const InputNumberFormatted = ({
  value = 0,
  onChange,
  precision = 2,
  suffix,
  ...rest
}: InputNumberFormattedProps) => {
  const formatDisplay = (val: number): string =>
    Number(val).toFixed(precision).replace(".", ",") + (suffix ?? "");

  const parseValue = (raw: string): number => {
    const digits = raw.replace(/\D/g, "");
    return digits ? parseInt(digits, 10) / 10 ** precision : 0;
  };

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseValue(e.target.value);
      onChange?.(parsed);
    },
    [onChange, precision],
  );

  return (
    <Input {...rest} value={formatDisplay(value)} onChange={handleChange} inputMode="numeric" />
  );
};

export default InputNumberFormatted;
