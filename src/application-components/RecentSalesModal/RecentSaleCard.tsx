import { PaymentMethod } from "@/enums/payment.enum";
import { SaleStatus, SaleType } from "@/enums/sale.enum";
import { SaleModel } from "@/model/sale.model";
import { formatDateFromApi } from "@/uperp/common/dates";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { calculateTotalCartItems } from "@/uperp/common/formulas/saleFormulas";
import { SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { Button, Card, Space, Tag, Typography } from "antd";
import { Receipt } from "lucide-react";

const { Text } = Typography;

type RecentSaleCardProps = {
  sale: SaleModel;
  onClick?: (sale: SaleModel) => void;
  onView: (sale: SaleModel) => void;
  showItemCount?: boolean;
  showPayments?: boolean;
};

const SALE_TYPE_MAP: Record<SaleType, { label: string; color: string }> = {
  [SaleType.NORMAL]: { label: "Balcão", color: "orange" },
  [SaleType.SERVICE]: { label: "Serviço", color: "blue" },
  [SaleType.PDV]: { label: "PDV", color: "purple" },
};

export const RecentSaleCard = ({
  sale,
  onClick,
  onView,
  showItemCount = false,
  showPayments = false,
}: RecentSaleCardProps) => {
  const typeInfo = SALE_TYPE_MAP[sale.type] || { label: sale.type, color: "default" };
  const total = formatPrice(calculateTotalCartItems(sale.items, sale.services, sale.discount));
  const isClickable = !!onClick;
  const itemCount = sale.items?.length ?? 0;

  return (
    <Card
      size="small"
      hoverable={isClickable}
      styles={{ body: { padding: 12 } }}
      onClick={() => onClick?.(sale)}
      style={{
        cursor: isClickable ? "pointer" : "default",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 14, display: "block", marginBottom: 2 }}>
            {sale.code}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {sale.createdAt ? formatDateFromApi(sale.createdAt) : "—"}
          </Text>
        </div>
        <Tag color={sale.status === SaleStatus.CANCELED ? "error" : "green"} style={{ margin: 0 }}>
          {sale.status}
        </Tag>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <Tag color={typeInfo.color} style={{ margin: 0 }}>
          {typeInfo.label}
        </Tag>
        {showItemCount && (
          <Tag style={{ margin: 0 }}>
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </Tag>
        )}
      </div>

      {showPayments && sale.payments && sale.payments.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Pagamentos
          </Text>
          <Space size={4} wrap>
            {sale.payments.map((p) => (
              <Tag key={p.id} style={{ margin: 0, fontSize: 11 }}>
                {SALE_PAYMENT_LABEL[p.type as PaymentMethod] || p.type}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
          Cliente
        </Text>
        <Text style={{ fontSize: 13 }}>{sale.internCustomer?.name || "—"}</Text>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #f0f0f0",
          paddingTop: 8,
        }}
      >
        <Text strong style={{ color: "#F26B1F", fontSize: 15 }}>
          {total}
        </Text>
        <Button
          size="small"
          type="link"
          icon={<Receipt size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            onView(sale);
          }}
        >
          Ver
        </Button>
      </div>
    </Card>
  );
};
