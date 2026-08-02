import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetOneWithParams } from "@/hooks/useGetOneWithParams";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { ProductModel } from "@/model/product.model";
import { InternCustomerService } from "@/services/internCustomer.service";
import { ProductService } from "@/services/product.service";
import { calculeSalePriceRange } from "@/uperp/common/productFormulas";
import { Form, message, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableProps } from "antd/lib/table";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IVariationSelection } from "./components/SpecialPriceVariationModal";
import { ICustomerCreateForm, ICustomerSpecialPrice, ILinkedVariation } from "./types";
const { Text } = Typography;

const productService = new ProductService();

const internCustomerService = new InternCustomerService();
export function useCustomerFormController({ isEdit }: { isEdit?: boolean }) {
  const [form] = Form.useForm<ICustomerCreateForm>();

  const { id } = useParams<{ id: string }>();

  const { invalidateQuery } = useCacheManager();

  const { data: customerToEdit } = useGetOneWithParams<InternCustomerModel>(internCustomerService, {
    id: id as string,
    enabled: !!id,
  });

  const {
    data: products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useGenericTableFetch<ProductModel>({
    service: productService,
    options: {
      sort: { field: "name", order: "ASC" },
    },
  });

  const [defaultPrice, setDefaultPrice] = useState<number>(0);

  const [selectedProducts, setSelectedProducts] = useState<ProductModel[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [variationModalProducts, setVariationModalProducts] = useState<ProductModel[]>([]);

  const [linkedVariations, setLinkedVariations] = useState<ILinkedVariation[]>([]);

  const rowSelection: TableProps<ProductModel>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedProducts(selectedRows);
    },
    getCheckboxProps: (record: ProductModel) => ({
      disabled: record.name === "Disabled User",
      name: record.name,
    }),
  };

  const handleOpenVariationModal = () => {
    setVariationModalProducts(selectedProducts);
    setIsVariationModalOpen(true);
  };

  const handleCloseVariationModal = () => {
    setIsVariationModalOpen(false);
  };

  const handleConfirmVariationSelection = (selections: IVariationSelection[]) => {
    setLinkedVariations((prev) => {
      const map = new Map<number, ILinkedVariation>();
      prev.forEach((item) => map.set(item.productEspecificationId, item));
      selections.forEach((s) => {
        map.set(s.productEspecification.id, {
          productId: s.product.id,
          productName: s.product.name,
          productEspecificationId: s.productEspecification.id,
          variation: s.productEspecification,
          specialPrice: s.specialPrice,
        });
      });
      const next = Array.from(map.values());
      return next;
    });
    setIsVariationModalOpen(false);
    setVariationModalProducts([]);
    setDefaultPrice(0);
    setSelectedProducts([]);
    setSelectedRowKeys([]);
  };

  const handleRemoveLinkedVariation = (productEspecificationId: number) => {
    setLinkedVariations((prev) => {
      const next = prev.filter((v) => v.productEspecificationId !== productEspecificationId);
      return next;
    });
  };

  const handleUpdateSpecialPrice = (productEspecificationId: number, specialPrice: number) => {
    setLinkedVariations((prev) => {
      const next = prev.map((v) =>
        v.productEspecificationId === productEspecificationId ? { ...v, specialPrice } : v,
      );
      return next;
    });
  };

  const productTableColumns: ColumnsType<ProductModel> = [
    { key: "id", title: "Id", dataIndex: "id", width: 110 },
    {
      title: "Produto",
      dataIndex: "name",
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
    {
      title: "Preço",
      dataIndex: "salePrice",
      render: (_, p: ProductModel) => `${calculeSalePriceRange(p.productEspecifications)}`,
    },
    {
      title: "Preços especiais cadastrados",
      render: (_, p: ProductModel) => {
        const linked = linkedVariations.filter((v) => v.productId === p.id);
        if (linked.length === 0) return <Text type="secondary">-</Text>;
        return (
          <Space direction="vertical" size={0}>
            {linked.map((v) => (
              <Space size={4} key={v.productEspecificationId}>
                <Tag style={{ margin: 0 }} color="geekblue">
                  R$ {v.specialPrice.toFixed(2)}
                </Tag>
              </Space>
            ))}
          </Space>
        );
      },
    },
  ];

  const [isSubmiting, setIsSubmiting] = useState(false);
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setIsSubmiting(true);
      if (linkedVariations.length) {
        form.setFieldValue(
          "internCustomerPrices",
          linkedVariations.map((v): ICustomerSpecialPrice => ({
            id: v.specialPriceId,
            specialPrice: v.specialPrice,
            productEspecificationId: v.productEspecificationId,
          })),
        );
      }

      const values = form.getFieldsValue(true);
      console.log("values", values);

      if (!isEdit) {
        await internCustomerService.create(values);
      } else {
        await internCustomerService.update(Number(id), values);
      }

      message.success(`Cliente ${isEdit ? "atualizado" : "criado"} com sucesso!`);
      invalidateQuery(internCustomerService);
      navigate(-1);
    } catch (error: any) {
      message.error(error.message || "Não foi possível salvar as alterações.");
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      if (isEdit && id) {
        await internCustomerService.delete(Number(id));
        message.success("Cliente removido com sucesso!");
        invalidateQuery(internCustomerService);
        navigate(-1);
      }
    } catch (error: any) {
      message.error(error.message || "Não foi possível remover o cliente.");
    }
  };

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (isEdit && customerToEdit) {
      const linked: ILinkedVariation[] = customerToEdit.internCustomerPrices.map((p) => ({
        specialPriceId: p.id,
        productId: p.productEspecification.product.id,
        productName: p.productEspecification.product.name,
        productEspecificationId: p.productEspecificationId,
        variation: p.productEspecification,
        specialPrice: Number(p.specialPrice),
      }));
      setLinkedVariations(linked);

      form.setFieldsValue({
        name: customerToEdit?.name,
        address: customerToEdit?.address,
        phoneNumber: customerToEdit?.phoneNumber,
        type: customerToEdit?.type,
        internCustomerPrices: customerToEdit.internCustomerPrices.map((p) => ({
          id: p.id,
          productEspecificationId: p.productEspecificationId,
          specialPrice: Number(p.specialPrice),
        })),
      });
    }
  }, [isEdit, form, customerToEdit]);

  return {
    handleGoBack,
    form,
    products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    productTableColumns,
    rowSelection,
    defaultPrice,
    setDefaultPrice,
    selectedProducts,
    isVariationModalOpen,
    variationModalProducts,
    handleOpenVariationModal,
    handleCloseVariationModal,
    handleConfirmVariationSelection,
    linkedVariations,
    handleRemoveLinkedVariation,
    handleUpdateSpecialPrice,
    handleSubmit,
    isSubmiting,
    handleDeleteCustomer,
  };
}
