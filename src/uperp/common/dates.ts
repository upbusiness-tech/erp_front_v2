export const formatIsoDateIntoDateTimeString = (isoDate: string): string => {
  if (isoDate === "") return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const adjusted = new Date(date.getTime() - 3 * 60 * 60 * 1000);

  const day = String(adjusted.getDate()).padStart(2, "0");
  const month = String(adjusted.getMonth() + 1).padStart(2, "0");
  const year = adjusted.getFullYear();
  const hour = String(adjusted.getHours()).padStart(2, "0");
  const minute = String(adjusted.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}`;
};
