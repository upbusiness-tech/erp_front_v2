import { Input, Space } from "antd";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export type SearchBarItem = {
  /** Identificador único do campo de busca (ex: "name") */
  name: string;
  /** Valor controlado da busca */
  value: string;
  /** Chamado com o novo valor após o debounce */
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

type SearchBarProps = {
  /** Lista de campos de busca a serem exibidos */
  searches: SearchBarItem[];
};

const SearchField = ({ search }: { search: SearchBarItem }) => {
  const { value, onChange, placeholder, debounceMs } = search;
  const delay = debounceMs ?? 500;
  const [inputValue, setInputValue] = useState(value ?? "");
  const debouncedValue = useDebounce(inputValue, delay);

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  return (
    <Input
      allowClear
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      prefix={<Search size={16} color="#9CA3AF" />}
      placeholder={placeholder ?? "Buscar..."}
      style={{ minWidth: 480, maxWidth: 600 }}
    />
  );
};

export const SearchBar = ({ searches }: SearchBarProps) => {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      {searches.map((search) => (
        <SearchField key={search.name} search={search} />
      ))}
    </Space>
  );
};
