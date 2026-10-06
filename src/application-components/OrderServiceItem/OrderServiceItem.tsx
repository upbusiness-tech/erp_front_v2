import { useSalesStore } from "@/stores/sales.store";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { ISaleServiceForm } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { Button, List, Row, Space, Typography } from "antd";
import { Trash2 } from "lucide-react";

const { Text } = Typography;

type OrderServiceItemProps = {
  item: ISaleServiceForm;
  index: number;
};

export const OrderServiceItem = ({ item, index }: OrderServiceItemProps) => {
  const { removeSaleService } = useSalesStore();

  return (
    <List.Item
      actions={[
        <Button
          key="r"
          size="small"
          type="text"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => removeSaleService(index)}
        />,
      ]}
    >
      <List.Item.Meta
        title={<Space>{item.description}</Space>}
        description={
          <Space direction="vertical" size={2} style={{ width: "100%" }}>
            {item.onwerEmployee && (
              <Text type="secondary" italic style={{ fontSize: 13 }}>
                Funcionário responsável: {item.onwerEmployee}
              </Text>
            )}
            <Row align="middle" justify="space-between" style={{ width: "100%" }}>
              <Text strong style={{ fontSize: 15 }}>
                {formatPrice(item.amount)}
              </Text>
            </Row>
          </Space>
        }
      />
    </List.Item>
  );
};
