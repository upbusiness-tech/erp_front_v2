import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { SaleType } from "@/enums/sale.enum";
import { SaleItemModel, SaleModel, SaleReceiptModel } from "@/model/sale.model";
import { SaleService } from "@/services/sale.service";
import { formatDateFromApi } from "@/uperp/common/dates";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { calculateTotalCartItems } from "@/uperp/common/formulas/saleFormulas";
import { createSaleReceipt, SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { mapSaleStatus, mapSaleType } from "@/uperp/common/util/sale.util";
import { Space, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { BRAND } from "@/theme/colors";

const saleService = new SaleService();

export function useCashFlowHistorySalesTableController({ cashFlowId }: { cashFlowId: number }) {
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
      filter: {
        field: "cashFlowId",
        operator: "$eq",
        value: cashFlowId,
      },
      sort: { field: "createdAt", order: "DESC" },
      join: [
        { field: "items" },
        { field: "items.product" },
        { field: "items.productEspecification" },
        { field: "items.internCustomerPrice" },
        { field: "internCustomer" },
        { field: "payments" },
        { field: "services" },
      ],
    },
  });

  const salesColumns: ColumnsType<SaleModel> = [
    { title: "Código", dataIndex: "code", width: 50 },
    {
      title: "Data",
      dataIndex: "createdAt",
      width: 50,
      render: (v?: string) => (v ? formatDateFromApi(v) : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 50,
      render: (_, sale: SaleModel) => (
        <Tag color={mapSaleStatus[sale.status].color}>{sale.status}</Tag>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 50,
      render: (t: SaleType) => {
        const { label, color } = mapSaleType[t] || { label: t, color: "default" };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Total",
      align: "right",
      width: 50,
      render: (_, sale: SaleModel) => (
        <strong style={{ color: BRAND }}>
          {formatPrice(calculateTotalCartItems(sale.items, sale.services ?? [], sale.discount))}
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
    receiptSale,
    handleViewRecentSale,
    handleCloseReceipt,
  };
}
