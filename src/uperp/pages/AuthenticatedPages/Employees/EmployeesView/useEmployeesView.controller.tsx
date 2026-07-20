import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { EmployeeModel } from "@/model/employee.model";
import { EmployeesPaths } from "@/routes/AuthenticatedRoutes/Employees/routes";
import { EmployeeService } from "@/services/employee.service";
import { PaginatedResponse } from "@/types/crud.types";
import { Avatar, Button, message, Popconfirm, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const employeeService = new EmployeeService();

export default function useEmployeesViewController() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeModel | undefined>(undefined);

  const navigate = useNavigate();

  const openModal = (employee: EmployeeModel) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(undefined);
    setIsDetailModalOpen(false);
  };

  const { data: employeesPaginated, isLoading } = useGetAllWithParams<
    PaginatedResponse<EmployeeModel>
  >(employeeService, {
    page,
    limit,
    sort: {
      field: "name",
      order: "ASC",
    },
  });

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const { invalidateQuery } = useCacheManager();

  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteEmployee = async (uid: string) => {
    try {
      setIsDeleting(true);
      await employeeService.delete(uid);
      invalidateQuery(employeeService);
      message.success("Funcionário removido com sucesso!");
    } catch (error) {
      message.error("Erro ao remover o funcionário.");
    } finally {
      setIsDeleting(false);
    }
  };

  const tableColumns: ColumnsType<EmployeeModel> = [
    {
      title: "Nome",
      dataIndex: "name",
      render: (n) => (
        <Space>
          <Avatar style={{ background: "#F26B1F" }}>{n.charAt(0)}</Avatar>
          {n}
        </Space>
      ),
    },
    {
      title: "Cargo",
      dataIndex: "type",
      render: (r) => <Tag color="orange">{r}</Tag>,
    },
    {
      title: "Username",
      dataIndex: "user.username",
      render: (_, e: EmployeeModel) => <Text>{e.user.username}</Text>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (a: boolean) => <Tag color={a ? "green" : "default"}>{a ? "Ativo" : "Inativo"}</Tag>,
    },
    {
      title: "Ações",
      width: 150,
      render: (_, e: EmployeeModel) => (
        <Space>
          <Button size="small" icon={<Eye size={14} />} onClick={() => openModal(e)} />
          <Button
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => navigate(EmployeesPaths.EDIT.replace(":uid", e.uid))}
          />
          {!e.isPrimaryEmployee && (
            <Popconfirm title="Remover funcionário?" onConfirm={() => handleDeleteEmployee(e.uid)}>
              <Button loading={isDeleting} size="small" danger icon={<Trash2 size={14} />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return {
    tableColumns,
    employees: employeesPaginated?.data,
    isLoading,
    closeModal,
    isDetailModalOpen,
    selectedEmployee,
    navigate,
    page,
    total: employeesPaginated?.total,
    pageSize: limit,
    handlePageChange,
    handlePageSizeChange,
  };
}
