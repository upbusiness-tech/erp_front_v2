import AppRouter from "@/routes/AppRouter";
import { App as AntdApp, ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
import { StoreProvider } from "./uperp/store";
import { uperpTheme } from "./uperp/theme";

export function App() {
  return (
    <ConfigProvider locale={ptBR} theme={uperpTheme}>
      <AntdApp>
        <StoreProvider>
          <AppRouter />
        </StoreProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
