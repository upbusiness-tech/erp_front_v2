import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { PaginatedResponse } from "@/types/crud.types";
import { message } from "antd";
import { useState } from "react";

const productCategoryService = new ProductCategoryService();
const productService = new ProductService();

export function useStockCategoriesOverviewController() {
  const { data: categories } =
    useGetAllWithParams<PaginatedResponse<ProductCategoryModel>>(productCategoryService);

  const { invalidateQuery } = useCacheManager();

  const [category, setCategory] = useState<string>("");
  const [color, setColor] = useState<string>("#F26B1F");

  const [submiting, setsubmiting] = useState(false);
  const submitCategory = async () => {
    try {
      setsubmiting(true);
      await productCategoryService.create({ name: category, color });
      invalidateQuery(productCategoryService);
      setCategory("");
    } catch (error) {
      console.info();
    } finally {
      setsubmiting(false);
    }
  };

  const [editingCat, setEditingCat] = useState<ProductCategoryModel | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await productCategoryService.delete(id);
      refreshCategories();
      message.success("Categoria removida!");
    } catch {
      message.error("Erro ao remover categoria");
    }
  };

  const refreshCategories = () => {
    invalidateQuery(productCategoryService);
    invalidateQuery(productService);
  };

  return {
    category,
    setCategory,
    color,
    setColor,
    submitCategory,
    categories,
    submiting,
    refreshCategories,
    handleDelete,
    editingCat,
    setEditingCat,
  };
}
