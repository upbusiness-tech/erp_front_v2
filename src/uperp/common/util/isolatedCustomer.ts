import type { IsolatedCustomerForm } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";

const hasText = (value?: string) => Boolean(value?.trim());

export type SaleCustomerSource = {
  internCustomer?: { name?: string | null } | null;
  isolatedCustomer?: { name?: string | null } | null;
};

export const getSaleCustomerLabel = (sale: SaleCustomerSource, emptyFallback = "—"): string => {
  if (hasText(sale.internCustomer?.name ?? undefined)) {
    return sale.internCustomer?.name ?? emptyFallback;
  }

  if (sale.isolatedCustomer != null) {
    const name = sale.isolatedCustomer.name?.trim();
    return name ? `${name} (Avulso)` : "(Avulso)";
  }

  return emptyFallback;
};

export const hasIsolatedCustomerIdentity = (customer?: IsolatedCustomerForm) =>
  Boolean(
    customer &&
    (hasText(customer.name) || hasText(customer.address) || hasText(customer.phoneNumber)),
  );

export const isIsolatedCustomerFormInvalid = (customer?: IsolatedCustomerForm) =>
  hasIsolatedCustomerIdentity(customer) && !hasText(customer?.name);

export const toIsolatedCustomerPayload = (
  customer?: IsolatedCustomerForm,
): IsolatedCustomerForm | undefined => {
  if (!customer || !hasText(customer.name)) return undefined;

  return {
    name: customer.name?.trim(),
    type: customer.type,
    address: hasText(customer.address) ? customer.address?.trim() : undefined,
    phoneNumber: hasText(customer.phoneNumber) ? customer.phoneNumber?.trim() : undefined,
  };
};
