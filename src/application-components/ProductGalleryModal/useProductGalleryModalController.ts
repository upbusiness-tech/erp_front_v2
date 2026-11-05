import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { GalleryModel } from "@/model/product.model";
import { ProductService } from "@/services/product.service";
import type { PaginatedResponse } from "@/types/crud.types";
import { useEffect, useMemo, useState } from "react";

const LIMIT = 12;
const productGalleryService = new ProductService("gallery");

type UseProductGalleryModalControllerProps = {
  open: boolean;
};

export function useProductGalleryModalController({ open }: UseProductGalleryModalControllerProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open]);

  const { data, isLoading, isError, refetch } = useGetAllWithParams<
    PaginatedResponse<GalleryModel>
  >(
    productGalleryService,
    {
      page,
      limit: LIMIT,
      sort: { field: "createdAt", order: "DESC" },
    },
    { enabled: open },
  );

  const items = useMemo(() => {
    const raw = data?.data ?? [];
    const seen = new Set<string>();
    const deduped: GalleryModel[] = [];
    for (const item of raw) {
      if (!item.productPicture) continue;
      if (seen.has(item.productPicture)) continue;
      seen.add(item.productPicture);
      deduped.push(item);
    }
    return deduped;
  }, [data]);

  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 0;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  return {
    items,
    isLoading,
    isError,
    refetch,
    page,
    total,
    pageCount,
    limit: LIMIT,
    handlePageChange,
  };
}
