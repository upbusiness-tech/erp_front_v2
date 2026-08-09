import { api } from "@/config/axios.config";
import { CompanySettingUsageModel } from "@/model/companySettingUsage.model";
import { CompanySettingUsageService } from "@/services/companySettingUsage.service";
import { PaginatedResponse } from "@/types/crud.types";
import { message } from "antd";
import { create } from "zustand";

interface CompanySettingsState {
  settings: CompanySettingUsageModel[];
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  toggleSetting: (id: number) => Promise<boolean>;
  getSetting: (key: string) => CompanySettingUsageModel | undefined;
  hasSettingActive: (config: any) => boolean;
}

const service = new CompanySettingUsageService();

export const useCompanySettingsStore = create<CompanySettingsState>((set, get) => ({
  settings: [],
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const result = (await service.getAll(
        undefined,
      )) as PaginatedResponse<CompanySettingUsageModel>;
      set({ settings: result.data });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleSetting: async (id: number) => {
    try {
      await api.patch(`${service.BASE_PATH}/${id}/toggle`);
      set((state) => ({
        settings: state.settings.map((s) => (s.id === id ? { ...s, value: !s.isActive } : s)),
      }));
      return true;
    } catch {
      message.error("Erro ao atualizar a configuração.");
      return false;
    }
  },

  getSetting: (key: string) => {
    return get().settings.find((s) => s.companySetting.key === key);
  },

  hasSettingActive: (config: any) => {
    return get().settings.find((s) => s.companySetting.key === config.key)?.isActive ?? false;
  },
}));
