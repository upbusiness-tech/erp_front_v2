import type { InputProps } from "antd";
import { Input } from "antd";
import type { ChangeEvent } from "react";
import { useCallback } from "react";

type InputNumberFormattedProps = Omit<InputProps, "value" | "onChange" | "type"> & {
  value?: number;
  onChange?: (value: number) => void;
};

const formatDisplay = (val: number): string => val.toFixed(2).replace(".", ",");

const parseValue = (raw: string): number => {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
};

const InputNumberFormatted = ({ value = 0, onChange, ...rest }: InputNumberFormattedProps) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseValue(e.target.value);
      onChange?.(parsed);
    },
    [onChange],
  );

  return (
    <Input {...rest} value={formatDisplay(value)} onChange={handleChange} inputMode="numeric" />
  );
};

export default InputNumberFormatted;
