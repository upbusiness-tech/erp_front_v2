import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { useHasPermission } from "@/hooks/useHasPermission";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { CustomersPaths } from "@/routes/AuthenticatedRoutes/Customers/routes";
import { InternCustomerService } from "@/services/internCustomer.service";
import { PermissionsRef } from "@/uperp/common/permissions/const/permissions.ref";
import { Avatar, Button, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const internCustomerService = new InternCustomerService();
export function useCustomerViewController() {
  const canEditInternCustomer = useHasPermission(PermissionsRef.InternCustomer.Update.name);
  const canDeleteInternCustomer = useHasPermission(PermissionsRef.InternCustomer.Delete.name);
  const canCreateInternCustomer = useHasPermission(PermissionsRef.InternCustomer.Create.name);
  const canViewInternCustomer = useHasPermission(PermissionsRef.InternCustomer.Read.name);

  const [search, setSearch] = useState("");

  const handleSearchChange = (value: string | string[]) => {
    setSearch(value as string);
  };

  const {
    data: customers,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    total,
  } = useGenericTableFetch<InternCustomerModel>({
    service: internCustomerService,
    options: {
      filter: search.trim()
        ? [{ field: "name", operator: "$contL", value: search.trim() }]
        : undefined,
    },
    enabled: canViewInternCustomer,
  });

  const navigate = useNavigate();

  const [viewCustomerModalOpen, setViewCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<InternCustomerModel | undefined>(
    undefined,
  );

  const handleOpenViewModal = (c: InternCustomerModel) => {
    setSelectedCustomer(c);
    setViewCustomerModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedCustomer(undefined);
    setViewCustomerModalOpen(false);
  };

  const handleGoToEdit = (id: number) => {
    navigate(CustomersPaths.UPDATE.replace(":id", String(id)));
  };

  const handleGoToCreate = () => {
    navigate(CustomersPaths.CREATE);
  };

  const tableColumns: ColumnsType<InternCustomerModel> = [
    {
      title: "Nome",
      dataIndex: "name",
      render: (n, c: InternCustomerModel) => (
        <Space>
          <Avatar size="small" style={{ background: "#F26B1F" }}>
            {n.charAt(0)}
          </Avatar>
          {n}
        </Space>
      ),
    },
    { title: "Tipo", dataIndex: "type" },
    { title: "Endereço", dataIndex: "address" },
    {
      title: "Preços especiais",
      render: (_, c: InternCustomerModel) => (
        <Tag color={"lime"}>{c.internCustomerPrices.length} produtos</Tag>
      ),
    },
    {
      title: "Ações",
      width: 160,
      render: (_, c: InternCustomerModel) => (
        <Space>
          <Button size="small" icon={<Eye size={14} />} onClick={() => handleOpenViewModal(c)} />
          {canEditInternCustomer && (
            <Button size="small" icon={<Pencil size={14} />} onClick={() => handleGoToEdit(c.id)} />
          )}
        </Space>
      ),
    },
  ];

  return {
    customers,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    total,
    tableColumns,
    setSelectedCustomer,
    selectedCustomer,
    handleCloseViewModal,
    viewCustomerModalOpen,
    handleGoToEdit,
    handleGoToCreate,
    handleSearchChange,
    search,
    canEditInternCustomer,
    canDeleteInternCustomer,
    canCreateInternCustomer,
    canViewInternCustomer,
  };
}
