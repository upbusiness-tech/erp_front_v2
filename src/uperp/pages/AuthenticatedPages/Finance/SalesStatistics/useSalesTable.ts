import dayjs from "dayjs";
import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { PaymentMethod } from "@/enums/payment.enum";
import type { SaleModel } from "@/model/sale.model";
import { SaleService } from "@/services/sale.service";
import { useMemo, useState } from "react";

const saleService = new SaleService();

const SALE_JOIN = [
  { field: "items" },
  { field: "items.product" },
  { field: "items.productEspecification" },
  { field: "items.internCustomerPrice" },
  { field: "internCustomer" },
  { field: "payments" },
  { field: "services" },
];

export function useSalesTable(from: string, to: string) {
  const [code, setCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isolatedCustomerName, setIsolatedCustomerName] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string[]>([]);

  const filter = useMemo(
    () => [
      // `createdAt` é persistido em UTC e exibido em UTC-3 (ver `formatDateFromApi`).
      // Desloca o limite do dia local (Brasil) para UTC: 00:00 local = 03:00 UTC.
      { field: "createdAt", operator: "$gte", value: `${from} 03:00:00` },
      {
        field: "createdAt",
        operator: "$lt",
        value: `${dayjs(to).add(1, "day").format("YYYY-MM-DD")} 03:00:00`,
      },
      ...(code.trim() ? [{ field: "code", operator: "$contL", value: code.trim() }] : []),
      ...(customerName.trim()
        ? [
            {
              field: "internCustomer.name",
              operator: "$contUL",
              value: customerName.trim(),
            },
          ]
        : []),
      ...(isolatedCustomerName.trim()
        ? [
            {
              field: "isolatedCustomer",
              operator: "$contJsonNameUL",
              value: isolatedCustomerName.trim(),
            },
          ]
        : []),
      ...(status.length ? [{ field: "status", operator: "$in", value: status }] : []),
      ...(paymentMethod.length
        ? [{ field: "payments.type", operator: "$in", value: paymentMethod }]
        : []),
    ],
    [from, to, code, customerName, isolatedCustomerName, status, paymentMethod],
  );

  const {
    data,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  } = useGenericTableFetch<SaleModel>({
    service: saleService,
    options: {
      sort: { field: "createdAt", order: "DESC" },
      filter,
      join: SALE_JOIN,
    },
  });

  const handleCodeChange = (value: string | string[]) => {
    setCode(value as string);
    resetPage();
  };

  const handleCustomerNameChange = (value: string | string[]) => {
    setCustomerName(value as string);
    resetPage();
  };

  const handleIsolatedCustomerNameChange = (value: string | string[]) => {
    setIsolatedCustomerName(value as string);
    resetPage();
  };

  const handleStatusChange = (value: string | string[]) => {
    setStatus(value as string[]);
    resetPage();
  };

  const handlePaymentMethodChange = (value: string | string[]) => {
    setPaymentMethod(value as string[]);
    resetPage();
  };

  return {
    data,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    code,
    handleCodeChange,
    customerName,
    handleCustomerNameChange,
    status,
    handleStatusChange,
    paymentMethod,
    handlePaymentMethodChange,
    handleIsolatedCustomerNameChange,
    isolatedCustomerName,
  };
}
