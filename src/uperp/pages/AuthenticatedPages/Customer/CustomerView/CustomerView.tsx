import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { Button, Card } from "antd";
import { Plus } from "lucide-react";
import { CustomerDetailsModal } from "@/application-components/CustomerDetailsModal/CustomerDetailsModal";
import { useCustomerViewController } from "./useCustomerView.controller";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { NoPermission } from "@/application-components/NoPermission/NoPermission";

export function CustomerView() {
  const {
    customers,
    tableColumns,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    total,
    selectedCustomer,
    handleCloseViewModal,
    viewCustomerModalOpen,
    handleGoToEdit,
    handleGoToCreate,
    handleSearchChange,
    search,
    canCreateInternCustomer,
    canViewInternCustomer,
  } = useCustomerViewController();

  return (
    <>
      <Card
        title="Clientes"
        extra={
          <Button
            disabled={!canCreateInternCustomer}
            type="primary"
            icon={<Plus size={14} />}
            onClick={handleGoToCreate}
          >
            Novo Cliente
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
        {canViewInternCustomer ? (
          <GenericTable<InternCustomerModel>
            data={customers || []}
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
      </Card>

      <CustomerDetailsModal
        isOpen={viewCustomerModalOpen}
        customer={selectedCustomer}
        onClose={handleCloseViewModal}
        onEdit={handleGoToEdit}
      />
    </>
  );
}
