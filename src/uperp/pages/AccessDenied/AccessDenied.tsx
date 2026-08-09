import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Acesso Bloqueado"
      subTitle="Você não tem permissão para acessar este recurso."
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      }
    />
  );
}
