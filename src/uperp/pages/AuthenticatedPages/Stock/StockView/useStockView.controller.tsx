import { StockPaths } from "@/routes/AuthenticatedRoutes/Stock/routes";
import { useNavigate } from "react-router-dom";

export function useStockViewController() {
  const navigate = useNavigate();

  const handleGoToCreateProduct = () => {
    navigate(StockPaths.CREATE_PRODUCT);
  };

  return {
    handleGoToCreateProduct,
  };
}
