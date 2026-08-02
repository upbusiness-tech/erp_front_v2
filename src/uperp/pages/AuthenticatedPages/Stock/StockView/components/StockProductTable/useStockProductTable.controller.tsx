import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { ProductModel } from "@/model/product.model";
import { StockPaths } from "@/routes/AuthenticatedRoutes/Stock/routes";
import { ProductService } from "@/services/product.service";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
} from "@/uperp/common/productFormulas";
import { Button, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableProps } from "antd/lib/table";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;

const productService = new ProductService();

export function useStockProductTableController() {
  const { data, total, isLoading, page, pageSize, handlePageChange, handlePageSizeChange } =
    useGenericTableFetch<ProductModel>({
      service: productService,
      options: {
        sort: { field: "name", order: "ASC" },
      },
    });

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
      render: (_, p: ProductModel) => (
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
      ),
    },
    { title: "Un.", dataIndex: "unitOfMeasure", width: 70, render: (u: string) => u || "—" },
    { title: "Fornecedor", dataIndex: "supplierName", render: (u: string) => u || "—" },
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
          {calculeStockTotalByProductEspecification(v.productEspecifications)} un.
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

  return {
    tableColumns,
    data,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    rowSelection,
  };
}
