import { Card } from "antd";

import { StockOverviewCards } from "./components/StockOverviewCards/StockOverviewCards";
import { useStockOverviewController } from "./components/StockOverviewCards/useStockOverview.controller";
import { StockTab } from "./components/StockTab/StockTab";
import { useStockViewController } from "./useStockView.controller";

export const StockView = () => {
  const { handleGoToCreateProduct } = useStockViewController();
  const { overview, isLoading: isLoadingOverview } = useStockOverviewController();

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <StockOverviewCards overview={overview} isLoading={isLoadingOverview} />
      </div>
      <Card>
        <StockTab onNewProduct={handleGoToCreateProduct} />
      </Card>
    </>
  );
};
