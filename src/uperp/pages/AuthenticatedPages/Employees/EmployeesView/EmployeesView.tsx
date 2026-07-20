import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { EmployeeModel } from "@/model/employee.model";
import { EmployeesPaths } from "@/routes/AuthenticatedRoutes/Employees/routes";
import { Button, Card } from "antd";
import { Plus } from "lucide-react";
import { EmployeeViewModal } from "./components/EmployeeViewModal/EmployeeViewModal";
import useEmployeesViewController from "./useEmployeesView.controller";

export function EmployeesView() {
  const {
    tableColumns,
    employees,
    isLoading,
    closeModal,
    isDetailModalOpen,
    selectedEmployee,
    navigate,
    page,
    total,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useEmployeesViewController();

  return (
    <>
      <Card
        title="Funcionários"
        extra={
          <Button
            onClick={() => navigate(EmployeesPaths.CREATE)}
            type="primary"
            icon={<Plus size={14} />}
          >
            Novo Funcionário
          </Button>
        }
      >
        <GenericTable<EmployeeModel>
          data={employees!}
          columns={tableColumns}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {isDetailModalOpen && (
          <EmployeeViewModal employee={selectedEmployee} onCancel={closeModal} />
        )}
      </Card>
    </>
  );
}
