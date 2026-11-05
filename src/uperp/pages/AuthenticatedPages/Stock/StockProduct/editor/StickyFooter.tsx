import { Button, Space, Tag, Typography } from "antd";

const { Text } = Typography;

type StickyFooterProps = {
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  invalidCount: number;
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
};

export function StickyFooter({
  createdCount,
  updatedCount,
  deletedCount,
  invalidCount,
  isDirty,
  saving,
  onSave,
}: StickyFooterProps) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        marginTop: 16,
        borderTop: "1px solid #f0f0f0",
        background: "#fff",
      }}
    >
      <Space wrap>
        <Text type="secondary">
          {createdCount} nova{createdCount === 1 ? "" : "s"} · {updatedCount} atualizada
          {updatedCount === 1 ? "" : "s"} · {deletedCount} removida
          {deletedCount === 1 ? "" : "s"}
        </Text>
        {invalidCount > 0 && <Tag color="red">{invalidCount} inválida(s)</Tag>}
      </Space>

      <Button
        type="primary"
        onClick={onSave}
        loading={saving}
        disabled={!isDirty || invalidCount > 0 || saving}
      >
        Salvar alterações
      </Button>
    </div>
  );
}
