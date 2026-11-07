import { Input, Select, Space } from "antd";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type SearchBarOption = {
  value: string;
  label: string;
};

export type SearchBarItem = {
  name: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  debounceMs?: number;
  size?: "medium" | "large" | "small" | "middle";
  maxWidth?: number;
  type?: "text" | "select";
  options?: SearchBarOption[];
};

type SearchBarProps = {
  searches: SearchBarItem[];
};

type SearchFieldProps = {
  search: SearchBarItem;
};

const SearchField = ({ search }: SearchFieldProps) => {
  const { value, onChange, placeholder, debounceMs } = search;
  const delay = debounceMs ?? 500;
  const externalValue = typeof value === "string" ? value : "";
  const [inputValue, setInputValue] = useState(externalValue);
  const lastExternalValueRef = useRef(externalValue);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (externalValue === lastExternalValueRef.current) return;

    lastExternalValueRef.current = externalValue;
    setInputValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    if (inputValue === externalValue) return;

    const timer = window.setTimeout(() => {
      lastExternalValueRef.current = inputValue;
      onChangeRef.current(inputValue);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [inputValue, externalValue, delay]);

  return (
    <Input
      size={search.size || "medium"}
      allowClear
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      prefix={<Search size={16} color="#9CA3AF" />}
      placeholder={placeholder ?? "Buscar..."}
      style={{ width: search.maxWidth }}
    />
  );
};

const SelectField = ({ search }: SearchFieldProps) => {
  const { value, onChange, placeholder, options } = search;
  const selectedValues = Array.isArray(value) ? value : [];

  return (
    <Select
      mode="multiple"
      size={search.size || "medium"}
      allowClear
      value={selectedValues}
      onChange={(val) => onChange(val)}
      placeholder={placeholder ?? "Selecionar..."}
      options={options ?? []}
      style={{ minWidth: search.maxWidth ?? 200 }}
      maxTagCount="responsive"
    />
  );
};

export const SearchBar = ({ searches }: SearchBarProps) => {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      {searches.map((search) => {
        if (search.type === "select") {
          return <SelectField key={search.name} search={search} />;
        }
        return <SearchField key={search.name} search={search} />;
      })}
    </Space>
  );
};
