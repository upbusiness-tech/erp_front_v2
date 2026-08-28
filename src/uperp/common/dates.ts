const AMBIENT = import.meta.env.VITE_ENV_AMBIENT;

export const formatDateFromApi = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setHours(date.getHours() - 3);
  return date.toLocaleString("pt-BR");
};
