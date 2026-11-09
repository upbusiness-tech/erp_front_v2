import { Card, Col, Row, Skeleton, Typography } from "antd";
import { AlertCircle, Package, TrendingUp, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import type { ProductStockOverviewModel } from "@/model/productStockOverview.model";
import { BRAND, BRAND_SOFT, DANGER } from "@/theme/colors";

const { Text } = Typography;

type StockOverviewCardsProps = {
  overview?: ProductStockOverviewModel;
  isLoading?: boolean;
};

const fmtInt = new Intl.NumberFormat("pt-BR");
const fmtBrl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #F0F0F0",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  height: "100%",
};

const cardBodyStyle: React.CSSProperties = {
  padding: "20px 20px 18px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const iconContainerStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: BRAND_SOFT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

type CardConfig = {
  label: string;
  description: string;
  icon: ReactNode;
  value: ReactNode;
};

function OverviewCard({ label, description, icon, value }: CardConfig) {
  return (
    <Card styles={{ body: cardBodyStyle }} style={cardStyle} bordered={false}>
      <div style={headerRowStyle}>
        <Text
          style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.1, color: "rgba(0,0,0,0.75)" }}
        >
          {label}
        </Text>
        <div style={iconContainerStyle}>{icon}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Text
          strong
          style={{
            fontSize: 28,
            lineHeight: 1.2,
            color: "#111418",
            fontWeight: 700,
          }}
        >
          {value}
        </Text>
      </div>
      <Text style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: "rgba(0,0,0,0.62)" }}>
        {description}
      </Text>
    </Card>
  );
}

function OverviewCardSkeleton() {
  return (
    <Card styles={{ body: cardBodyStyle }} style={cardStyle} bordered={false}>
      <Skeleton active paragraph={{ rows: 1 }} />
    </Card>
  );
}

export const StockOverviewCards = ({ overview, isLoading }: StockOverviewCardsProps) => {
  const productsTotal = overview?.productsTotal ?? 0;
  const costPriceTotal = overview?.costPriceTotal ?? 0;
  const salePriceTotal = overview?.salePriceTotal ?? 0;
  const soldOutTotal = overview?.soldOutTotal ?? 0;

  if (isLoading) {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <OverviewCardSkeleton />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <OverviewCardSkeleton />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <OverviewCardSkeleton />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <OverviewCardSkeleton />
        </Col>
      </Row>
    );
  }

  const cards: CardConfig[] = [
    {
      label: "Produtos",
      description: "Total de produtos cadastrados",
      icon: <Package size={18} color={BRAND} />,
      value: fmtInt.format(productsTotal),
    },
    {
      label: "Valor de custo",
      description: "Total investido no estoque",
      icon: <Wallet size={18} color={BRAND} />,
      value: fmtBrl.format(costPriceTotal),
    },
    {
      label: "Valor de venda",
      description: "Potencial de venda do estoque atual",
      icon: <TrendingUp size={18} color={BRAND} />,
      value: fmtBrl.format(salePriceTotal),
    },
    {
      label: "Esgotados",
      description: "Produtos sem estoque disponível",
      icon: <AlertCircle size={18} color={BRAND} />,
      value: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>{fmtInt.format(soldOutTotal)}</span>
          {soldOutTotal > 0 && (
            <span
              aria-label="há produtos esgotados"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: DANGER,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}
        </span>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card) => (
        <Col xs={24} sm={12} xl={6} key={card.label}>
          <OverviewCard {...card} />
        </Col>
      ))}
    </Row>
  );
};

export default StockOverviewCards;
