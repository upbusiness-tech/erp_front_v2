import { Card } from "antd";

import { StockTab } from "./components/StockTab/StockTab";
import { useStockViewController } from "./useStockView.controller";

export const StockView = () => {
  const { handleGoToCreateProduct } = useStockViewController();

  return (
    <>
      <Card>
        <StockTab onNewProduct={handleGoToCreateProduct} />
      </Card>
    </>
  );
};
