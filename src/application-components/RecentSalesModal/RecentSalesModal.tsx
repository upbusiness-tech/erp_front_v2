import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { SaleModel } from "@/model/sale.model";
import { ColumnsType } from "antd/es/table";
import { Modal } from "antd";

type RecentSalesModalProps = {
  open: boolean;
  onClose: () => void;
  columns: ColumnsType<SaleModel>;
  data: SaleModel[];
  isLoading: boolean;
  total?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick?: (sale: SaleModel) => void;
};

export const RecentSalesModal = ({
  open,
  onClose,
  columns,
  data,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: RecentSalesModalProps) => {
  return (
    <Modal open={open} title="Vendas recentes" onCancel={onClose} footer={null} width={860}>
      <GenericTable
        rowKey="id"
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRowClick={onRowClick}
        locale={{ emptyText: "Nenhuma venda registrada" }}
      />
    </Modal>
  );
};
