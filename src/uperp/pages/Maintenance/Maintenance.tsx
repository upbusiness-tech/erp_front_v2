import { ReactNode } from "react";
import { Button, Result, Typography } from "antd";
import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MaintenanceProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backPath?: string;
}

export function Maintenance({
  title = "Em Manutenção",
  description = "Esta área do sistema está temporariamente indisponível. Nossa equipe está trabalhando para concluir esta funcionalidade em breve.",
  children,
  showBackButton = true,
  backButtonLabel = "Voltar",
  backPath,
}: MaintenanceProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Result
        icon={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              margin: "0 auto",
              borderRadius: "50%",
              background: "#F26B1F15",
              color: "#F26B1F",
            }}
          >
            <Wrench size={36} />
          </div>
        }
        title={<Typography.Title level={3}>{title}</Typography.Title>}
        subTitle={
          <Typography.Text
            type="secondary"
            style={{ fontSize: 16, maxWidth: 480, display: "block" }}
          >
            {description}
          </Typography.Text>
        }
        extra={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {children}
            {showBackButton && (
              <Button type="primary" size="large" onClick={handleBack}>
                {backButtonLabel}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
