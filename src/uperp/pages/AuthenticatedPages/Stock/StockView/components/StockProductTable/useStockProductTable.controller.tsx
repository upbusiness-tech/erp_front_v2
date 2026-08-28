import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { ProductModel } from "@/model/product.model";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductSupplierModel } from "@/model/productSupplier.model";
import { StockPaths } from "@/routes/AuthenticatedRoutes/Stock/routes";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { ProductSupplierService } from "@/services/productSupplier.service";
import type { PaginatedResponse } from "@/types/crud.types";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  showStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { Button, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableProps } from "antd/lib/table";
import { Eye, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;

const productService = new ProductService();
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
  }, [categoryFilter, search, supplierFilter, unitFilter]);

  const {
    data,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  } = useGenericTableFetch<ProductModel>({
    service: productService,
    options: {
      join: [{ field: "createByUser" }, { field: "createByUser.employee" }],
      sort: { field: "name", order: "ASC" },
      filter,
    },
  });

  // O status de estoque é agregado das variantes, sem suporte a filtro no backend,
  // então é aplicado no cliente sobre a página carregada.
  const filteredData = useMemo(() => {
    if (!stockStatusFilter.length) return data;
    return data.filter((p) => {
      const stockTotal = calculeStockTotalByProductEspecification(p.productEspecifications);
      if (stockStatusFilter.includes("out_of_stock") && stockTotal === 0) return true;
      if (stockStatusFilter.includes("low_stock") && stockTotal > 0 && stockTotal <= 20)
        return true;
      if (stockStatusFilter.includes("in_stock") && stockTotal > 20) return true;
      return false;
    });
  }, [data, stockStatusFilter]);

  const navigate = useNavigate();

  const handleGoToEditProduct = (id: number) => {
    navigate(StockPaths.UPDATE_PRODUCT.replace(":id", String(id)));
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
      title: "Variação (Tam, cor, marca)",
      render: (n: string, p: ProductModel) => (
        <Space direction="vertical" size={0}>
          {p.productEspecifications.map((pe) => (
            <Space size={4}>
              {pe.size && (
                <Tag style={{ margin: 0 }} color="orange">
                  {pe.size}
                </Tag>
              )}
              {pe.color && <Tag style={{ margin: 0 }}>{pe.color}</Tag>}
            </Space>
          ))}
        </Space>
      ),
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
                background: `${p.productCategory?.color || "#F26B1F"}`,
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
          <Button size="small" icon={<Eye size={14} />} onClick={() => onViewStats?.(p)} />
          <Button
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => handleGoToEditProduct(p.id)}
          />
        </Space>
      ),
    },
  ];

  return {
    tableColumns,
    data: filteredData,
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
