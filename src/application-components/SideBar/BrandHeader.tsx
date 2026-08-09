import { Typography } from "antd";
import { Store } from "lucide-react";

const { Title } = Typography;

interface BrandHeaderProps {
  dark: boolean;
  collapsed?: boolean;
}

export function BrandHeader({ dark, collapsed }: BrandHeaderProps) {
  return (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? 0 : "0 20px",
        gap: 10,
        borderBottom: dark ? "1px solid #1f1f1f" : "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "#F26B1F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Store color="#fff" size={20} />
      </div>
      {!collapsed && (
        <Title level={4} style={{ color: dark ? "#fff" : "#1f1f1f", margin: 0 }}>
          UpERP
        </Title>
      )}
    </div>
  );
}
