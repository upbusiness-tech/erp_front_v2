import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { PaymentMethod } from "@/enums/payment.enum";
import { SaleType } from "@/enums/sale.enum";
import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { SaleItemModel, SaleModel, SaleReceiptModel } from "@/model/sale.model";
import { SaleService } from "@/services/sale.service";
import { StatsDashboardService } from "@/services/statsDashboard.service";
import { SalesDashboardResponse } from "@/types/saleDashboard";
import { formatDateFromApi } from "@/uperp/common/dates";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { calculateTotalCartItems } from "@/uperp/common/formulas/saleFormulas";
import { createSaleReceipt, SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";

const saleService = new SaleService();
const saleDashboardService = new StatsDashboardService("sales-dashboard");

export const SALE_TYPE_OPTIONS = [
  { value: SaleType.NORMAL, label: "Balcão" },
  { value: SaleType.SERVICE, label: "Serviço" },
  { value: SaleType.PDV, label: "PDV" },
];

export const SALE_PAYMENT_METHOD_OPTIONS = Object.values(PaymentMethod).map((m) => ({
  value: m,
  label: SALE_PAYMENT_LABEL[m],
}));

export function useSaleHistoryController() {
  const { period, setPreset, setCustomRange } = useDashboardPeriod("this_month");

  const [search, setSearch] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string[]>([]);

  const handleSearchChange = (e: string | string[]) => setSearch(e as string);
  const handleSearchCustomerNameChange = (e: string | string[]) =>
    setSearchCustomerName(e as string);
  const handleTypeFilterChange = (values: string | string[]) => setTypeFilter(values as string[]);
  const handleMethodFilterChange = (values: string | string[]) =>
    setMethodFilter(values as string[]);

  const filter = useMemo(() => {
    return [
      ...(search ? [{ field: "code", operator: "$contL", value: search.trim() }] : []),
      ...(searchCustomerName
        ? [{ field: "internCustomer.name", operator: "$contL", value: searchCustomerName.trim() }]
        : []),
      ...(typeFilter.length > 0 ? [{ field: "type", operator: "$in", value: typeFilter }] : []),
      ...(methodFilter.length > 0
        ? [{ field: "payments.type", operator: "$in", value: methodFilter }]
        : []),
    ];
  }, [methodFilter, search, searchCustomerName, typeFilter]);

  const {
    data: sales,
    total: salesTotal,
    isLoading: salesLoading,
    page: salesPage,
    pageSize: salesPageSize,
    handlePageChange: salesPageChange,
    handlePageSizeChange: salesPageSizeChange,
  } = useGenericTableFetch<SaleModel>({
    service: saleService,
    options: {
      filter,
      sort: { field: "createdAt", order: "DESC" },
      join: [
        { field: "items" },
        { field: "items.product" },
        { field: "items.productEspecification" },
        { field: "items.internCustomerPrice" },
        { field: "internCustomer" },
        { field: "payments" },
      ],
    },
  });

  const {
    data: saleDashboardData,
    isLoading: loadingSaleDashboard,
    isFetching,
    isError,
    error,
  } = useGetAllWithParams<SalesDashboardResponse>(saleDashboardService, undefined, {
    queryParams: {
      from: period.from,
      to: period.to,
      ...(methodFilter.length ? { paymentType: methodFilter.join(",") } : {}),
      ...(typeFilter.length ? { saleType: typeFilter.join(",") } : {}),
      ...(searchCustomerName ? { customerName: searchCustomerName } : {}),
      ...(search ? { saleCode: search } : {}),
    },
  });

  const salesColumns: ColumnsType<SaleModel> = [
    { title: "Código", dataIndex: "code", width: 110 },
    {
      title: "Data",
      dataIndex: "createdAt",
      width: 130,
      render: (v?: string) => (v ? formatDateFromApi(v) : "—"),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 100,
      render: (t: SaleType) => {
        const map: Record<SaleType, { label: string; color: string }> = {
          [SaleType.NORMAL]: { label: "Balcão", color: "orange" },
          [SaleType.SERVICE]: { label: "Serviço", color: "blue" },
          [SaleType.PDV]: { label: "PDV", color: "purple" },
        };
        const { label, color } = map[t] || { label: t, color: "default" };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Cliente",
      render: (_, sale: SaleModel) => sale.internCustomer?.name || "—",
    },
    {
      title: "Itens",
      dataIndex: "items",
      width: 70,
      align: "center",
      render: (items: SaleItemModel[]) => items?.length ?? 0,
    },
    {
      title: "Pagamentos",
      render: (_, sale: SaleModel) =>
        sale.payments?.length ? (
          <Space size={4} wrap>
            {sale.payments.map((p) => (
              <Tag key={p.id} style={{ margin: 0 }}>
                {SALE_PAYMENT_LABEL[p.type] || p.type}
              </Tag>
            ))}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      title: "Total",
      width: 110,
      align: "right",
      render: (_, sale: SaleModel) => (
        <strong style={{ color: "#F26B1F" }}>
          {formatPrice(calculateTotalCartItems(sale.items, sale.discount))}
        </strong>
      ),
    },
  ];

  const [receiptSale, setReceiptSale] = useState<SaleReceiptModel | null>(null);
  const handleViewRecentSale = (sale: SaleModel) => {
    setReceiptSale(createSaleReceipt(sale));
  };

  const handleCloseReceipt = () => {
    setReceiptSale(null);
  };

  return {
    sales,
    salesTotal,
    salesLoading,
    salesPage,
    salesPageSize,
    salesPageChange,
    salesPageSizeChange,
    salesColumns,
    handleSearchChange,
    search,
    searchCustomerName,
    handleSearchCustomerNameChange,
    typeFilter,
    handleTypeFilterChange,
    methodFilter,
    handleMethodFilterChange,
    receiptSale,
    handleViewRecentSale,
    handleCloseReceipt,
    saleDashboardData,
    loadingSaleDashboard,
  };
}
