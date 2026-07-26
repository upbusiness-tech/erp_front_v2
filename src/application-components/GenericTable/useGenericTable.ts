import { useCallback, useState } from "react";

export interface UseGenericTableReturn {
  /** Página atual (1-indexed) */
  page: number;
  /** Quantidade de itens por página */
  pageSize: number;
  /** Atualiza a página atual */
  handlePageChange: (page: number) => void;
  /** Altera o pageSize e reseta para a página 1 */
  handlePageSizeChange: (pageSize: number) => void;
  /** Reseta para a página 1 sem alterar o pageSize */
  resetPage: () => void;
}

/**
 * Hook que gerencia o estado de paginação para ser usado com `GenericTable`.
 *
 * @example
 * ```tsx
 * const { page, pageSize, handlePageChange, handlePageSizeChange } = useGenericTable(10);
 *
 * <GenericTable
 *   data={items}
 *   page={page}
 *   pageSize={pageSize}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 * />
 * ```
 */
export function useGenericTable(initialPageSize = 8): UseGenericTableReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return { page, pageSize, handlePageChange, handlePageSizeChange, resetPage };
}
