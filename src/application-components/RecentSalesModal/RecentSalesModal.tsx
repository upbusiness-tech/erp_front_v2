import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { SaleStatus, SaleType } from "@/enums/sale.enum";
import { SaleModel } from "@/model/sale.model";
import { formatDateFromApi } from "@/uperp/common/dates";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { calculateTotalCartItems } from "@/uperp/common/formulas/saleFormulas";
import { Button, Grid, Modal, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Receipt } from "lucide-react";
import { RecentSaleCardList } from "./RecentSaleCardList";

const { useBreakpoint } = Grid;
const { Text } = Typography;

type RecentSalesModalProps = {
  open: boolean;
  onClose: () => void;
  data: SaleModel[];
  isLoading: boolean;
  total?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick?: (sale: SaleModel) => void;
  handleViewRecentSale: (sale: SaleModel) => void;
};

export const RecentSalesModal = ({
  open,
  onClose,
  data,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  handleViewRecentSale,
}: RecentSalesModalProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const columns: ColumnsType<SaleModel> = [
    { title: "Código", dataIndex: "code", width: 110 },
    {
      title: "Data",
      dataIndex: "createdAt",
      width: 130,
      render: (v?: string) => (v ? formatDateFromApi(v) : "—"),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 100,
      render: (t: SaleType) => {
        const map: Record<SaleType, { label: string; color: string }> = {
          [SaleType.NORMAL]: { label: "Balcão", color: "orange" },
          [SaleType.SERVICE]: { label: "Serviço", color: "blue" },
          [SaleType.PDV]: { label: "PDV", color: "purple" },
        };
        const { label, color } = map[t] || { label: t, color: "default" };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Status",
      render: (_, sale: SaleModel) => (
        <Tag color={sale.status === SaleStatus.CANCELED ? "error" : "green"}>{sale.status}</Tag>
      ),
    },
    {
      title: "Cliente",
      render: (_, sale: SaleModel) => sale.internCustomer?.name || "—",
    },
    {
      title: "Total",
      width: 110,
      align: "right",
      render: (_, sale: SaleModel) => (
        <strong style={{ color: "#F26B1F" }}>
          {formatPrice(calculateTotalCartItems(sale.items, sale.services, sale.discount))}
        </strong>
      ),
    },
    {
      title: "Ações",
      width: 90,
      align: "center",
      render: (_, sale: SaleModel) => (
        <Button
          size="small"
          type="link"
          icon={<Receipt size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewRecentSale(sale);
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Modal open={open} title="Vendas recentes" onCancel={onClose} footer={null} width={860}>
      {isMobile ? (
        <RecentSaleCardList
          data={data}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          onRowClick={onRowClick}
          onView={handleViewRecentSale}
        />
      ) : (
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
      )}
    </Modal>
  );
};
