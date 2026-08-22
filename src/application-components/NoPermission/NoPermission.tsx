import { LockOutlined } from "@ant-design/icons";
import { Empty, theme } from "antd";
import { CSSProperties } from "react";

interface NoPermissionProps {
  /** Nome do recurso exibido na mensagem (ex.: "vendas", "relatórios"). */
  resourceName?: string;
  /** Sobrescreve a mensagem padrão. */
  description?: string;
  className?: string;
  style?: CSSProperties;
}

export function NoPermission({ resourceName, description, className, style }: NoPermissionProps) {
  const { token } = theme.useToken();

  const defaultDescription = resourceName
    ? `Você não tem permissão para acessar ${resourceName}.`
    : "Você não tem permissão para acessar este recurso.";

  return (
    <Empty
      className={className}
      style={{ padding: token.paddingLG, ...style }}
      image={
        <LockOutlined
          style={{
            fontSize: 48,
            color: token.colorTextQuaternary,
          }}
        />
      }
      imageStyle={{ height: 60 }}
      description={description ?? defaultDescription}
    />
  );
}
