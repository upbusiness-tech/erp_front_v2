import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductCategoryService } from "@/services/productCategory.service";
import { Form, message } from "antd";
import { useEffect, useState } from "react";

const productCategoryService = new ProductCategoryService();

interface UseEditCategoryModalProps {
  editingCat: ProductCategoryModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_COLOR = "#F26B1F";

export function useEditCategoryModal({
  editingCat,
  onClose,
  onSuccess,
}: UseEditCategoryModalProps) {
  const [form] = Form.useForm<{ name: string }>();
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCat) {
      form.setFieldsValue({ name: editingCat.name });
      setColor(editingCat.color ?? DEFAULT_COLOR);
    }
  }, [editingCat, form]);

  const handleSave = async () => {
    if (!editingCat) return;
    try {
      setLoading(true);
      const { name } = form.getFieldsValue();
      await productCategoryService.update(editingCat.id, { name, color });
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error("Erro ao atualizar a categoria do produto");
    } finally {
      setLoading(false);
    }
  };

  return { form, color, setColor, loading, handleSave };
}
