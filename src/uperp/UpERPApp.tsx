import { useState } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import ptBR from "antd/locale/pt_BR";
import { StoreProvider } from "./store";
import { uperpTheme } from "./theme";
import { CompanyLogin } from "./auth/CompanyLogin";
import { EmployeeLogin } from "./auth/EmployeeLogin";
import { Dashboard } from "./Dashboard";

type Stage = "company" | "employee" | "app";

export function UpERPApp() {
  const [stage, setStage] = useState<Stage>("company");
  const [userName, setUserName] = useState("");

  return (
    <ConfigProvider locale={ptBR} theme={uperpTheme}>
      <AntdApp>
        <StoreProvider>
          {stage === "company" && <CompanyLogin onSuccess={() => setStage("employee")} />}
          {stage === "employee" && (
            <EmployeeLogin
              onBack={() => setStage("company")}
              onSuccess={(n) => {
                setUserName(n);
                setStage("app");
              }}
            />
          )}
          {stage === "app" && (
            <Dashboard userName={userName} onLogout={() => setStage("company")} />
          )}
        </StoreProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
