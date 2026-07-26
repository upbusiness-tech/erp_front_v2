import { uploadToCloudinary } from "@/lib/cloudinary";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CompanyDetailModel } from "@/model/company.model";
import { CompanyService } from "@/services/company.service";
import { Form, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { ICompanyUpdateForm } from "./types";

const companyService = new CompanyService("me");

export function useCompanyViewController() {
  const [form] = Form.useForm<ICompanyUpdateForm>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const pendingFileRef = useRef<File | null>(null);

  const { data: company, isLoading } = useGetAllWithParams<CompanyDetailModel>(companyService);

  const { invalidateQuery } = useCacheManager();

  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdateCompany = async (values: ICompanyUpdateForm) => {
    try {
      setIsUpdating(true);
      let pictureUrl = values.profilePicture;
      if (pendingFileRef.current) {
        pictureUrl = await uploadToCloudinary(pendingFileRef.current);
        pendingFileRef.current = null;
      }
      console.info(pictureUrl);
      await companyService.updateMe({ ...values, profilePicture: pictureUrl });
      invalidateQuery(companyService);
      message.success("Empresa atualizada com sucesso!");
    } catch (error) {
      message.error("Ocorreu um erro ao atualizar os dados da empresa");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileSelect = (file: File) => {
    pendingFileRef.current = file;
    setAvatarUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (company) {
      form.setFieldsValue({
        name: company.name,
        address: company.address,
        contactEmail: company.contactEmail,
        description: company.description,
        contactPhoneNumber: company.contactPhoneNumber,
        profilePicture: company.profilePicture,
      });
    }
  }, [company]);

  return {
    form,
    company,
    avatarUrl,
    isLoading,
    handleUpdateCompany,
    handleFileSelect,
    isUpdating,
  };
}
