import { CashFlowModel } from "@/model/cashFlow.model";
import { CashFlowService } from "@/services/cashFlow.service";
import { ICloseCashFlowForm } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CloseCashFlowModal/types";
import { message } from "antd";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CashFlowState {
  currentCashFlow: CashFlowModel | undefined;
  isLoadingCurrentCashOpen: boolean;
  loadCurrentCashOpen: (options?: { silent?: boolean }) => Promise<boolean>;
  handleCloseCashFlow: (data: ICloseCashFlowForm) => Promise<boolean>;
  handleOpenCashFlow: (data: { initialBalance: number }) => Promise<boolean>;
}

const cashFlowService = new CashFlowService();

export const useCashFlowStore = create<CashFlowState>()(
  persist(
    (set, get) => ({
      currentCashFlow: undefined,
      isLoadingCurrentCashOpen: false,

      loadCurrentCashOpen: async (options?: { silent?: boolean }) => {
        // Evita disparos concorrentes (ex: vários componentes montando ao mesmo tempo)
        if (get().isLoadingCurrentCashOpen) {
          return !!get().currentCashFlow;
        }

        set({ isLoadingCurrentCashOpen: true });
        try {
          const result = await cashFlowService.getCashFlowOpen();
          set({ currentCashFlow: result.data });
          return true;
        } catch (error: unknown) {
          const apiMessage = (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message;
          if (!options?.silent) {
            message.warning(apiMessage || "Erro ao carregar o caixa aberto da empresa.");
          }
          set({ currentCashFlow: undefined });
          return false;
        } finally {
          set({ isLoadingCurrentCashOpen: false });
        }
      },

      handleCloseCashFlow: async (data: ICloseCashFlowForm) => {
        try {
          await cashFlowService.closeCashFlow(data);
          set({ currentCashFlow: undefined });
          return true;
        } catch {
          return false;
        }
      },

      handleOpenCashFlow: async (data: { initialBalance: number }) => {
        try {
          const cashOpen = await cashFlowService.openCashFlow(data);
          set({ currentCashFlow: cashOpen.data });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "cash-flow-store",
      // Persiste apenas o caixa atual: sobrevive a F5 e a HMR do módulo do store
      partialize: (state) => ({ currentCashFlow: state.currentCashFlow }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
