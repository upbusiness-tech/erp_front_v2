const AMBIENT = import.meta.env.VITE_ENV_AMBIENT;

export const formatDateFromApi = (value: string) => {
  if (AMBIENT === "development") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    date.setHours(date.getHours() - 3);

    return date.toLocaleString("pt-BR");
  } else {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
  }
};
