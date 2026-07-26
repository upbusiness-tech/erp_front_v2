import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { useGetOneWithParams } from "@/hooks/useGetOneWithParams";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ProductModel } from "@/model/product.model";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { PaginatedResponse } from "@/types/crud.types";
import { Form, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IProductCreateFields, IProductVariantField, ProductUnitOfMeasure } from "./types";
import { useCacheManager } from "@/hooks/useCacheManager";

const productCategoryService = new ProductCategoryService();
const productService = new ProductService();

export function useStockProductController({ isEdit }: { isEdit?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<IProductCreateFields>();

  const { data: categories, isLoading: isLoadingCategories } =
    useGetAllWithParams<PaginatedResponse<ProductCategoryModel>>(productCategoryService);

  const { invalidateQuery } = useCacheManager();

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    try {
      await productService.delete(id);
      message.success("Produto removido com sucesso");
      invalidateQuery(productService);
      navigate(-1);
    } catch {
      message.error("Erro ao remover produto.");
    }
  };

  const [file, setfile] = useState<File | undefined>(undefined);

  const submitProduct = async (values: IProductCreateFields) => {
    try {
      if (file) {
        const url = await uploadToCloudinary(file);
        form.setFieldValue("productPicture", url);
      }
      if (isEdit && id) {
        const variants: IProductVariantField[] = values.variants.map((p) => {
          return {
            ...p,
            costPrice: Number(p.costPrice),
            salePrice: Number(p.salePrice),
          };
        });
        values.variants = variants;
        await productService.update(id, values);
      } else {
        await productService.create(values);
      }
      invalidateQuery(productService);
      message.success(`Produto ${isEdit ? "atualizado" : "cadastrado"} com sucesso`);
      navigate(-1);
    } catch (error) {
      message.error(`Erro ao ${isEdit ? "atualizar" : "cadastrar"} produto.`);
    }
  };

  const { data: productToEdit } = useGetOneWithParams<ProductModel>(productService, {
    id: id!,
    enabled: !!id && isEdit,
  });

  useEffect(() => {
    if (isEdit && productToEdit) {
      const variants: IProductVariantField[] = productToEdit.productEspecifications.map((pe) => {
        return {
          ...pe,
        };
      });

      form.setFieldsValue({
        name: productToEdit.name,
        productCategoryId: productToEdit.productCategoryId,
        productPicture: productToEdit.productPicture,
        supplierName: productToEdit.supplierName,
        unitOfMeasure: productToEdit.unitOfMeasure as ProductUnitOfMeasure,
        variants,
      });
    }
  }, [isEdit, productToEdit]);

  return {
    form,
    categories,
    isLoadingCategories,
    submitProduct,
    handleGoBack,
    setfile,
    handleDeleteProduct,
    isEdit: !!isEdit,
    id,
  };
}
