import { Button, Modal, Typography } from "antd";
import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

const { Text, Title } = Typography;

type ConfirmDangerModalProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDangerModal = ({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDangerModalProps) => (
  <Modal
    open={open}
    onCancel={onCancel}
    footer={[
      <Button key="cancel" onClick={onCancel} disabled={loading}>
        {cancelText}
      </Button>,
      <Button key="confirm" type="primary" danger loading={loading} onClick={onConfirm}>
        {confirmText}
      </Button>,
    ]}
    width={420}
    centered
    destroyOnHidden
  >
    <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <AlertTriangle size={28} color="#DC2626" />
      </div>
      <Title level={4} style={{ margin: "0 0 8px" }}>
        {title}
      </Title>
      {description && (
        <Text type="secondary" style={{ display: "block" }}>
          {description}
        </Text>
      )}
    </div>
  </Modal>
);
