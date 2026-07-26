import { Card } from "antd";

import { StockTab } from "./components/StockTab/StockTab";
import { useStockViewController } from "./useStockView.controller";

type StockViewProps = {
  a?: string;
};

export const StockView = ({ a }: StockViewProps) => {
  const { handleGoToCreateProduct } = useStockViewController();

  return (
    <>
      <Card>
        <StockTab onNewProduct={handleGoToCreateProduct} />
      </Card>
    </>
  );
};
