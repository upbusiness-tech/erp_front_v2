// Adapted from Tremor chartColors [v0.1.0]
// Uses the ERP system palette instead of the default Tailwind colors.
// The color tokens live in `src/styles.css` under `@theme inline`.

export type ColorUtility = "bg" | "stroke" | "fill" | "text";

export const chartColors = {
  brand: {
    bg: "bg-brand",
    stroke: "stroke-brand",
    fill: "fill-brand",
    text: "text-brand",
  },
  success: {
    bg: "bg-success",
    stroke: "stroke-success",
    fill: "fill-success",
    text: "text-success",
  },
  danger: {
    bg: "bg-danger",
    stroke: "stroke-danger",
    fill: "fill-danger",
    text: "text-danger",
  },
  warning: {
    bg: "bg-warning",
    stroke: "stroke-warning",
    fill: "fill-warning",
    text: "text-warning",
  },
  info: {
    bg: "bg-info",
    stroke: "stroke-info",
    fill: "fill-info",
    text: "text-info",
  },
  gray: {
    bg: "bg-muted-foreground",
    stroke: "stroke-muted-foreground",
    fill: "fill-muted-foreground",
    text: "text-muted-foreground",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string;
  };
};

export type AvailableChartColorsKeys = keyof typeof chartColors;

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>;

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[],
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>();
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length]);
  });
  return categoryColors;
};

export const getColorClassName = (color: AvailableChartColorsKeys, type: ColorUtility): string => {
  const fallbackColor = {
    bg: "bg-muted-foreground",
    stroke: "stroke-muted-foreground",
    fill: "fill-muted-foreground",
    text: "text-muted-foreground",
  };
  return chartColors[color]?.[type] ?? fallbackColor[type];
};
