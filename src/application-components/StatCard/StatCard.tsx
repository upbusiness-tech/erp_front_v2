import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import { BRAND_SOFT } from "@/theme/colors";

const { Text } = Typography;

export interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}

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

export function StatCard({ label, value, description, icon, onClick }: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      styles={{ body: cardBodyStyle }}
      style={{
        ...cardStyle,
        ...(isClickable ? { cursor: "pointer" } : {}),
      }}
      bordered={false}
      hoverable={isClickable}
      onClick={onClick}
    >
      <div style={headerRowStyle}>
        <Text
          style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.1, color: "rgba(0,0,0,0.75)" }}
        >
          {label}
        </Text>
        {icon && <div style={iconContainerStyle}>{icon}</div>}
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
      {description && (
        <Text style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: "rgba(0,0,0,0.62)" }}>
          {description}
        </Text>
      )}
    </Card>
  );
}
