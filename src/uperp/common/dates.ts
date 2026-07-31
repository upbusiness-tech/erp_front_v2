import { format, parseISO } from "date-fns";

export const formatIsoDateIntoDateTimeString = (isoDate: string): string => {
  if (isoDate === "") return "";
  return format(parseISO(isoDate), "dd/MM/yyyy HH:mm");
};
