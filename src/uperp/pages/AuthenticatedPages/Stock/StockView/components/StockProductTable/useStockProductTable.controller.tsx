import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { ProductExpandedViewModel, ProductModel } from "@/model/product.model";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductSupplierModel } from "@/model/productSupplier.model";
import { StockPaths } from "@/routes/AuthenticatedRoutes/Stock/routes";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { ProductSupplierService } from "@/services/productSupplier.service";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { BRAND } from "@/theme/colors";
import type { PaginatedResponse } from "@/types/crud.types";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  extractStockFormatByUnit,
  formatPrice,
  showStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import {
  buildExpandedStockFilter,
  matchesExpandedStockStatus,
} from "@/uperp/common/util/productExpandedFilters";
import { Button, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableProps } from "antd/lib/table";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;

const productService = new ProductService();
const productExpandedService = new ProductService("expanded");
const productCategoryService = new ProductCategoryService();
const productSupplierService = new ProductSupplierService();

export function useStockProductTableController({
  onViewStats,
}: {
  onViewStats?: (product: ProductModel) => void;
} = {}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string[]>([]);
  const [unitFilter, setUnitFilter] = useState<string[]>([]);
  const [stockStatusFilter, setStockStatusFilter] = useState<string[]>([]);
  const { hasSettingActive } = useCompanySettingsStore();
  const isExpandedMode = hasSettingActive(SettingsRef.Product.ViewProductOnExpandedMode);

  const handleSearchChange = (value: string | string[]) => {
    setSearch(value as string);
    resetPage();
  };

  const handleCategoryFilterChange = (values: string | string[]) => {
    setCategoryFilter(values as string[]);
    resetPage();
  };

  const handleSupplierFilterChange = (values: string | string[]) => {
    setSupplierFilter(values as string[]);
    resetPage();
  };

  const handleUnitFilterChange = (values: string | string[]) => {
    setUnitFilter(values as string[]);
    resetPage();
  };

  const handleStockStatusFilterChange = (values: string | string[]) => {
    setStockStatusFilter(values as string[]);
    resetPage();
  };
  const { data: categories } = useGetAllWithParams<PaginatedResponse<ProductCategoryModel>>(
    productCategoryService,
    { page: 1, limit: 1000 },
  );
  const { data: suppliers } = useGetAllWithParams<PaginatedResponse<ProductSupplierModel>>(
    productSupplierService,
    { page: 1, limit: 1000 },
  );

  const categoryOptions = (categories?.data ?? []).map((c) => ({
    value: String(c.id),
    label: c.name,
  }));
  const supplierOptions = (suppliers?.data ?? []).map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const filter = useMemo(() => {
    if (isExpandedMode) {
      return buildExpandedStockFilter({ categoryFilter, unitFilter, supplierFilter, search });
    }

    return [
      ...(search.trim() ? [{ field: "name", operator: "$contL", value: search.trim() }] : []),
      ...(categoryFilter.length
        ? [{ field: "productCategoryId", operator: "$in", value: categoryFilter }]
        : []),
      ...(supplierFilter.length
        ? [
            {
              field: "productEspecifications.productSupplierId",
              operator: "$in",
              value: supplierFilter,
            },
          ]
        : []),
      ...(unitFilter.length
        ? [{ field: "unitOfMeasure", operator: "$in", value: unitFilter }]
        : []),
    ];
  }, [categoryFilter, isExpandedMode, search, supplierFilter, unitFilter]);

  const {
    data: fetchedData,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  } = useGenericTableFetch<ProductModel | ProductExpandedViewModel>({
    service: isExpandedMode ? productExpandedService : productService,
    options: {
      ...(!isExpandedMode && {
        join: [{ field: "createByUser" }, { field: "createByUser.employee" }],
      }),
      sort: { field: "createdAt", order: "ASC" },
      filter,
    },
  });

  // O status de estoque é agregado das variantes, sem suporte a filtro no backend,
  // então é aplicado no cliente sobre a página carregada.
  const data = useMemo(() => {
    if (!stockStatusFilter.length) return fetchedData;
    return fetchedData.filter((p) => {
      const stockTotal = isExpandedMode
        ? (p as ProductExpandedViewModel).stockQuantity
        : calculeStockTotalByProductEspecification((p as ProductModel).productEspecifications);
      return matchesExpandedStockStatus(stockTotal, stockStatusFilter);
    });
  }, [fetchedData, isExpandedMode, stockStatusFilter]);

  const products = isExpandedMode ? [] : (data as ProductModel[]);
  const expandedProducts = isExpandedMode ? (data as ProductExpandedViewModel[]) : [];

  const navigate = useNavigate();

  const handleGoToEditProduct = (id: number, especificacaoId?: number) => {
    const path = StockPaths.UPDATE_PRODUCT.replace(":id", String(id));
    navigate(especificacaoId ? `${path}?especificacaoId=${especificacaoId}` : path);
  };

  const rowSelection: TableProps<ProductModel>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ProductModel[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
    },
    getCheckboxProps: (record: ProductModel) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  const tableColumns: ColumnsType<ProductModel> = [
    { title: "Id", dataIndex: "id", width: 110 },
    {
      title: "Produto",
      dataIndex: "name",
    },
    {
      title: "Categoria",
      dataIndex: "productCategoryId",
      render: (_, p: ProductModel) =>
        p.productCategory ? (
          <Space>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: p.productCategory?.color || BRAND,
              }}
            />
            <Text strong>{p.productCategory?.name || "-"}</Text>
          </Space>
        ) : (
          <Text>—</Text>
        ),
    },
    { title: "Un.", dataIndex: "unitOfMeasure", width: 70, render: (u: string) => u || "—" },
    {
      title: "Fornecedor",
      dataIndex: "supplierName",
      render: (_, p: ProductModel) => (
        <>
          {[
            ...new Set(
              p.productEspecifications
                .map((pe) => pe.productSupplier?.name)
                .filter((name): name is string => !!name),
            ),
          ].join(", ")}
        </>
      ),
    },
    {
      title: "Preço",
      dataIndex: "salePrice",
      render: (_, p: ProductModel) => `${calculeSalePriceRange(p.productEspecifications)}`,
    },
    {
      title: "Estoque",
      dataIndex: "stockQuantity",
      render: (_, v: ProductModel) => (
        <Tag
          color={
            calculeStockTotalByProductEspecification(v.productEspecifications) > 5
              ? "green"
              : calculeStockTotalByProductEspecification(v.productEspecifications) > 0
                ? "orange"
                : "red"
          }
        >
          {showStockTotalByProductEspecification(v, v.productEspecifications)}
        </Tag>
      ),
    },
    {
      title: "Ações",
      width: 110,
      render: (_, p) => (
        <Space>
          <Button
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => handleGoToEditProduct(p.id)}
          />
        </Space>
      ),
    },
  ];

  const expandedTableColumns: ColumnsType<ProductExpandedViewModel> = [
    {
      title: "Código",
      render: (_, row) => row.code || `#${row.productEspecificationId}`,
    },
    {
      title: "Produto",
      dataIndex: "productName",
    },
    {
      title: "Categoria",
      render: (_, row) => (
        <Space>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: row.productCategoryColor || BRAND,
            }}
          />
          <Text strong>{row.productCategoryName || "—"}</Text>
        </Space>
      ),
    },
    { title: "Un.", dataIndex: "unitOfMeasure", width: 70, render: (u: string) => u || "—" },
    {
      title: "Fornecedor",
      dataIndex: "supplierName",
      render: (supplierName: string) => supplierName || "—",
    },
    {
      title: "Preço",
      dataIndex: "salePrice",
      render: (salePrice: number) => formatPrice(salePrice),
    },
    {
      title: "Estoque",
      dataIndex: "stockQuantity",
      render: (stockQuantity: number, row) => (
        <Tag color={stockQuantity > 5 ? "green" : stockQuantity > 0 ? "orange" : "red"}>
          {extractStockFormatByUnit(row.unitOfMeasure, stockQuantity)}
        </Tag>
      ),
    },
    {
      title: "Ações",
      width: 110,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => handleGoToEditProduct(row.productId, row.productEspecificationId)}
          />
        </Space>
      ),
    },
  ];

  return {
    tableColumns,
    expandedTableColumns,
    isExpandedMode,
    data,
    products,
    expandedProducts,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
    search,
    handleSearchChange,
    categoryFilter,
    handleCategoryFilterChange,
    supplierFilter,
    handleSupplierFilterChange,
    unitFilter,
    handleUnitFilterChange,
    stockStatusFilter,
    handleStockStatusFilterChange,
    categoryOptions,
    supplierOptions,
    rowSelection,
  };
}
