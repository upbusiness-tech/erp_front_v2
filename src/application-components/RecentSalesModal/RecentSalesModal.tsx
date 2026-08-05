import { Sale } from "@/uperp/types";
import { Button, Modal, Space, Table, Tag, Typography } from "antd";
import { Receipt } from "lucide-react";

const { Text } = Typography;

type RecentSalesModalProps = {
  recentOpen: boolean;
  onClose: () => void;
};

export const RecentSalesModal = ({ recentOpen, onClose }: RecentSalesModalProps) => {
  const recentSales = [];
  const customers = [];

  return (
    <Modal open={recentOpen} title="Vendas recentes" onCancel={onClose} footer={null} width={860}>
      <Table
        rowKey="id"
        size="small"
        dataSource={[]}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 720 }}
        locale={{ emptyText: "Nenhuma venda registrada" }}
        columns={[
          { title: "Código", dataIndex: "id", width: 90 },
          { title: "Data", dataIndex: "date", width: 110 },
          {
            title: "Tipo",
            dataIndex: "type",
            width: 100,
            render: (t: string) => (
              <Tag color={t === "balcao" ? "orange" : "blue"}>
                {t === "balcao" ? "Balcão" : "Serviço"}
              </Tag>
            ),
          },
          { title: "Itens", dataIndex: "items", width: 70, align: "center" as const },
          // {
          //   title: "Cliente",
          //   dataIndex: "customerId",
          //   render: (id?: string) =>
          //     customers.find((c) => c.id === id)?.name || <Text type="secondary">—</Text>,
          // },
          {
            title: "Total",
            dataIndex: "total",
            width: 110,
            align: "right" as const,
            render: (v: number) => (
              <Text strong style={{ color: "#F26B1F" }}>
                R$ {v.toFixed(2)}
              </Text>
            ),
          },
          {
            title: "Ações",
            width: 130,
            render: (_, s: Sale) => (
              <Space>
                <Button
                  size="small"
                  icon={<Receipt size={14} />}
                  // onClick={() => {
                  //   setRecentOpen(false);
                  //   setReceiptSale(s);
                  // }}
                >
                  Ver
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
};
