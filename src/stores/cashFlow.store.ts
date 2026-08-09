import { CashFlowModel } from "@/model/cashFlow.model";
import { CashFlowService } from "@/services/cashFlow.service";
import { ICloseCashFlowForm } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CloseCashFlowModal/types";
import { message } from "antd";
import { AxiosError } from "axios";
import { create } from "zustand";

interface CashFlowState {
  currentCashFlow: CashFlowModel | undefined;
  loadCurrentCashOpen: () => Promise<boolean>;
  handleCloseCashFlow: (data: ICloseCashFlowForm) => Promise<boolean>;
  handleOpenCashFlow: (data: { initialBalance: number }) => Promise<boolean>;
}

const cashFlowService = new CashFlowService();
export const useCashFlowStore = create<CashFlowState>((set) => ({
  currentCashFlow: undefined,
  loadCurrentCashOpen: async () => {
    try {
      const result = await cashFlowService.getCashFlowOpen();
      set({ currentCashFlow: result.data });
      return true;
    } catch (error: AxiosError) {
      message.warning(error.response.data.message || "Erro ao carregar o caixa aberto da empresa.");
      set({ currentCashFlow: undefined });
      return false;
    }
  },
  handleCloseCashFlow: async (data: ICloseCashFlowForm) => {
    try {
      await cashFlowService.closeCashFlow(data);
      set({ currentCashFlow: undefined });
      return true;
    } catch (error) {
      return false;
    }
  },
  handleOpenCashFlow: async (data: { initialBalance: number }) => {
    try {
      const cashOpen = await cashFlowService.openCashFlow(data);
      set({ currentCashFlow: cashOpen.data });
      return true;
    } catch (error) {
      return false;
    }
  },
}));
