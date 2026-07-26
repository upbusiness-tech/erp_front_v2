import { Button, Space, Tabs } from "antd";
import { Archive, BarChart3, Plus, TagIcon } from "lucide-react";
import { StockCategoriesOverview } from "../StockCategoriesOverview/StockCategoriesOverview";
import { StockProductTable } from "../StockProductTable/StockProductTable";
import { StockStatsOverview } from "../StockStatsOverview/StockStatsOverview";
import { EStockViewTab } from "./types";

type StockTabProps = {
  onNewProduct: VoidFunction;
};

const SPACE_SIZE = 4;
const ICON_SIZE = 14;

export const StockTab = ({ onNewProduct }: StockTabProps) => {
  return (
    <Tabs
      defaultActiveKey="produtos"
      tabBarExtraContent={
        <Button type="primary" icon={<Plus size={14} />} onClick={onNewProduct}>
          Novo Produto
        </Button>
      }
      items={[
        {
          key: EStockViewTab.PRODUCT,
          label: (
            <Space size={SPACE_SIZE}>
              <Archive size={ICON_SIZE} /> Produtos
            </Space>
          ),
          children: <StockProductTable />,
        },
        {
          key: EStockViewTab.STATS,
          label: (
            <Space size={SPACE_SIZE}>
              <BarChart3 size={ICON_SIZE} /> Estatísticas
            </Space>
          ),
          children: <StockStatsOverview />,
        },
        {
          key: EStockViewTab.CATEGORIES,
          label: (
            <Space size={SPACE_SIZE}>
              <TagIcon size={ICON_SIZE} /> Categorias
            </Space>
          ),
          children: <StockCategoriesOverview />,
        },
      ]}
    />
  );
};
