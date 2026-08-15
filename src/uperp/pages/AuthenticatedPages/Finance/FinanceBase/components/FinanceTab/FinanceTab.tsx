import { Tabs } from "antd";
import { SaleHistory } from "../../../SaleHistory/SaleHistory";
import { CashFlowHistory } from "../../../CashFlowHistory/CashFlowHistory";

export const FinanceTab = () => {
  return (
    <Tabs
      defaultActiveKey="stats"
      items={[
        // { key: "stats", label: "Estatísticas", children: <></> },
        {
          key: "history",
          label: "Histórico de Vendas",
          children: <SaleHistory />,
        },
        {
          key: "cash",
          label: "Histórico de Caixas",
          children: <CashFlowHistory />,
        },
        // { key: "reports", label: "Relatórios", children: <Reports /> },
      ]}
    />
  );
};
