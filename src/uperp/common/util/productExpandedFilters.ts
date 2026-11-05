export type ExpandedFilter = {
  field: string;
  operator: "$contL" | "$in";
  value: string | string[];
};

export const EXPANDED_SEARCH_FIELDS = [
  "productName",
  "code",
  "barcode",
  "size",
  "color",
  "brand",
] as const;

export const buildExpandedFilter = (
  categoryFilter: string[],
  search: string | null,
): ExpandedFilter[] => {
  return [
    ...(search
      ? [
          {
            field: "productName",
            operator: "$contL" as const,
            value: formatSearchOnExpandedView(search),
          },
        ]
      : []),
    ...(categoryFilter.length > 0
      ? [{ field: "productCategoryId", operator: "$in" as const, value: categoryFilter }]
      : []),
  ];
};

export const buildExpandedStockFilter = ({
  categoryFilter,
  unitFilter,
  supplierFilter,
  search,
}: {
  categoryFilter: string[];
  unitFilter: string[];
  supplierFilter: string[];
  search: string;
}): ExpandedFilter[] => [
  ...buildExpandedFilter(categoryFilter, search),
  ...(unitFilter.length
    ? [{ field: "unitOfMeasure", operator: "$in" as const, value: unitFilter }]
    : []),
  ...(supplierFilter.length
    ? [{ field: "productSupplierId", operator: "$in" as const, value: supplierFilter }]
    : []),
];

/**
 * Status de estoque aplicado no cliente. No modo expandido o valor é o
 * `stockQuantity` da própria variação.
 */
export const matchesExpandedStockStatus = (
  stockQuantity: number,
  stockStatusFilter: string[],
): boolean => {
  if (!stockStatusFilter.length) return true;
  if (stockStatusFilter.includes("out_of_stock") && stockQuantity === 0) return true;
  if (stockStatusFilter.includes("low_stock") && stockQuantity > 0 && stockQuantity <= 20)
    return true;
  if (stockStatusFilter.includes("in_stock") && stockQuantity > 20) return true;
  return false;
};

/**
 * Vai formatar o valor de uma pesquisa por nome no modo de visualização expandida dos produtos para que dê um match melhor no banco de dados.
 */
export const formatSearchOnExpandedView = (search: string) =>
  `%${search.trim().split(/\s+/).join("%")}%`;
