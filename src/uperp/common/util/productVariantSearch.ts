export type VariantSearchable = {
  code?: string | null;
  barcode?: string | null;
  size?: string | null;
  color?: string | null;
  brand?: string | null;
};

/**
 * Busca local de variantes usada no formulário de edição de produto.
 * Retorna verdadeiro quando o termo está vazio para que todas as variantes
 * permaneçam visíveis, e ignora caixa e espaços nas extremidades.
 */
export const matchesVariantSearch = (variant: VariantSearchable | undefined, term: string) => {
  const normalizedTerm = term.trim().toLocaleLowerCase();
  if (!normalizedTerm) return true;

  return [variant?.code, variant?.barcode, variant?.size, variant?.color, variant?.brand].some(
    (value) => value?.toLocaleLowerCase().includes(normalizedTerm),
  );
};
