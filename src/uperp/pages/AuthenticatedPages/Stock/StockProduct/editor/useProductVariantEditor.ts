import type { ProductEspecificationModel } from "@/model/productEspecification.model";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { matchesVariantSearch } from "@/uperp/common/util/productVariantSearch";
import type {
  DraftValidation,
  VariantDiff,
  VariantDraft,
  VariantFilter,
  VariantSnapshot,
  VariantSort,
} from "./types";
import {
  computeVariantDiff,
  createVariantKey,
  toVariantDraft,
  toVariantSnapshot,
} from "./variantDiff";
import { validateDraft } from "./variantValidation";

export const VARIANT_PAGE_SIZE = 10;

type UseProductVariantEditorOptions = {
  initialVariants?: ProductEspecificationModel[];
  productId?: number;
};

const buildEmptyDraft = (partial: Partial<VariantDraft> = {}): VariantDraft => ({
  key: createVariantKey(),
  isNew: true,
  id: undefined,
  code: partial.code ?? "",
  barcode: partial.barcode ?? null,
  salePrice: partial.salePrice ?? 0,
  costPrice: partial.costPrice ?? 0,
  isStockControlled: partial.isStockControlled ?? true,
  stockQuantity: partial.stockQuantity ?? 0,
  size: partial.size ?? null,
  color: partial.color ?? null,
  brand: partial.brand ?? null,
  productSupplierId: partial.productSupplierId ?? null,
});

export function useProductVariantEditor({
  initialVariants = [],
  productId,
}: UseProductVariantEditorOptions = {}) {
  const [baseline, setBaseline] = useState<VariantSnapshot[]>([]);
  const [draft, setDraft] = useState<VariantDraft[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VariantFilter>("all");
  const [sort, setSort] = useState<VariantSort>({ field: "code", order: "asc" });
  const [page, setPage] = useState(1);
  const [focusVariantId, setFocusVariantId] = useState<number | null>(null);
  const initializedRef = useRef<number | null>(null);

  const reset = useCallback((variants: ProductEspecificationModel[] = []) => {
    const snapshots = variants.map(toVariantSnapshot);
    setBaseline(snapshots);
    setDraft(snapshots.map(toVariantDraft));
    setSearch("");
    setFilter("all");
    setPage(1);
    setFocusVariantId(null);
  }, []);

  useEffect(() => {
    if (productId === undefined) return;
    if (initializedRef.current === productId) return;

    initializedRef.current = productId;
    reset(initialVariants);
  }, [initialVariants, productId, reset]);

  const validation: DraftValidation = useMemo(() => validateDraft(draft), [draft]);

  const diff: VariantDiff = useMemo(() => computeVariantDiff(baseline, draft), [baseline, draft]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    let list = draft;

    if (term) {
      list = list.filter((variant) => matchesVariantSearch(variant, term));
    }

    if (filter === "invalid") {
      list = list.filter((variant) => validation.byKey.has(variant.key));
    } else if (filter === "with_stock") {
      list = list.filter((variant) => variant.stockQuantity > 0);
    } else if (filter === "without_stock") {
      list = list.filter((variant) => variant.stockQuantity <= 0);
    } else if (filter === "no_price") {
      list = list.filter((variant) => !variant.salePrice);
    }

    if (focusVariantId !== null) {
      list = list.filter((variant) => variant.id === focusVariantId);
    }

    const direction = sort.order === "asc" ? 1 : -1;

    return [...list].sort((a, b) => {
      if (sort.field === "code") return a.code.localeCompare(b.code) * direction;
      return (Number(a[sort.field]) - Number(b[sort.field])) * direction;
    });
  }, [draft, filter, focusVariantId, search, sort, validation]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / VARIANT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * VARIANT_PAGE_SIZE, currentPage * VARIANT_PAGE_SIZE),
    [currentPage, filtered],
  );

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const updateVariant = useCallback((key: string, patch: Partial<VariantDraft>) => {
    setDraft((previous) =>
      previous.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)),
    );
  }, []);

  const addVariant = useCallback((partial: Partial<VariantDraft> = {}) => {
    const newVariant = buildEmptyDraft(partial);
    setDraft((previous) => [...previous, newVariant]);
    setSearch("");
    setFilter("all");
    setPage(1);
    return newVariant;
  }, []);

  const duplicateVariant = useCallback((key: string) => {
    const cloneKey = createVariantKey();

    setDraft((previous) => {
      const source = previous.find((variant) => variant.key === key);
      if (!source) return previous;

      const clone: VariantDraft = {
        ...source,
        key: cloneKey,
        id: undefined,
        isNew: true,
        code: source.code ? `${source.code}-2` : "",
      };

      return [...previous, clone];
    });

    setSearch("");
    setFilter("all");
    setPage(1);

    return cloneKey;
  }, []);

  const removeVariants = useCallback((keys: string[]) => {
    const keySet = new Set(keys);
    setDraft((previous) => previous.filter((variant) => !keySet.has(variant.key)));
  }, []);

  const markSaved = useCallback(
    (productWithVariants?: { productEspecifications?: ProductEspecificationModel[] }) => {
      reset(productWithVariants?.productEspecifications ?? []);
    },
    [reset],
  );

  return {
    baseline,
    draft,
    setDraft,
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    page,
    setPage,
    pageCount,
    paged,
    filtered,
    focusVariantId,
    setFocusVariantId,
    validation,
    diff,
    updateVariant,
    addVariant,
    duplicateVariant,
    removeVariants,
    reset,
    markSaved,
  };
}
