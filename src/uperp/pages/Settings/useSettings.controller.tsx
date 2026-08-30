import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CompanySettingUsageModel } from "@/model/companySettingUsage.model";
import { CompanySettingUsageService } from "@/services/companySettingUsage.service";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { PaginatedResponse } from "@/types/crud.types";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import { useStore } from "@/uperp/store";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useCallback, useMemo, useState } from "react";

const moduleTitles: Record<string, string> = {
  Sale: "Vendas",
  Product: "Produtos",
};

const settingsByKeyMap = (() => {
  const map = new Map<string, { module: string; description: string; icon: React.ReactNode }>();
  for (const entry of Object.values(SettingsRef)) {
    for (const setting of Object.values(entry)) {
      map.set(setting.key, {
        module: setting.module,
        description: setting.description,
        icon: setting.icon,
      });
    }
  }
  return map;
})();

interface SettingItem {
  id: number;
  key: string;
  module: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
}

export function useSettingsController() {
  const service = useMemo(() => new CompanySettingUsageService(), []);
  const { data: apiSettings, isLoading } =
    useGetAllWithParams<PaginatedResponse<CompanySettingUsageModel>>(service);
  const { toggleSetting, loadSettings } = useCompanySettingsStore();
  const { settings: legacySettings, updateSetting } = useStore();
  const queryClient = useQueryClient();

  const mergedSettings = useMemo<SettingItem[]>(() => {
    if (!apiSettings) return [];
    return apiSettings.data.map((s) => {
      const def = settingsByKeyMap.get(s.companySetting.key);
      return {
        id: s.id,
        key: s.companySetting.key,
        module: def?.module ?? s.companySetting.module,
        description: def?.description ?? s.companySetting.description,
        icon: def?.icon ?? null,
        value: s.isActive,
      };
    });
  }, [apiSettings]);

  const groupedSettings = useMemo(() => {
    const groups = new Map<string, SettingItem[]>();
    for (const s of mergedSettings) {
      const list = groups.get(s.module) ?? [];
      list.push(s);
      groups.set(s.module, list);
    }
    return Array.from(groups.entries()).map(([module, items]) => ({
      module,
      title: moduleTitles[module] ?? module,
      items,
    }));
  }, [mergedSettings]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleToggle = useCallback(
    async (id: number) => {
      try {
        setIsSubmitting(true);
        const ok = await toggleSetting(id);
        if (ok) {
          queryClient.invalidateQueries({ queryKey: [service.BASE_PATH] });
          await loadSettings();
          message.success("Preferência atualizada");
        }
      } catch (error) {
        message.error("Ocorreu um erro ao atualizar a configuração.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [toggleSetting, queryClient, service.BASE_PATH],
  );

  const handleDarkSidebarToggle = useCallback(
    (value: boolean) => {
      updateSetting("darkSidebar", value);
      message.success("Preferência atualizada");
    },
    [updateSetting],
  );

  return {
    groupedSettings,
    isLoading,
    handleToggle,
    darkSidebar: legacySettings.darkSidebar,
    handleDarkSidebarToggle,
    isSubmitting,
  };
}
