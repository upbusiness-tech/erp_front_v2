import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { NoPermission } from "@/application-components/NoPermission/NoPermission";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
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
    handleSearchChange,
    search,
    canCreateEmployee,
    canViewEmployee,
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
            disabled={!canCreateEmployee}
          >
            Novo Funcionário
          </Button>
        }
      >
        <SearchBar
          searches={[
            {
              name: "name",
              value: search,
              onChange: handleSearchChange,
              placeholder: "Buscar por nome",
            },
          ]}
        />
        {canViewEmployee ? (
          <GenericTable<EmployeeModel>
            data={employees || []}
            columns={tableColumns}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : (
          <NoPermission />
        )}

        {isDetailModalOpen && (
          <EmployeeViewModal employee={selectedEmployee} onCancel={closeModal} />
        )}
      </Card>
    </>
  );
}
