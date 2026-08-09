import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CompanyDetailModel } from "@/model/company.model";
import { CompanyService } from "@/services/company.service";
import { useAuthStore } from "@/stores/auth.store";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useEffect } from "react";

export function useBootstrapController() {
  const companyService = new CompanyService("me");
  const { data: company } = useGetAllWithParams<CompanyDetailModel>(companyService);
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany);
  const loadCurrentCashOpen = useCashFlowStore((s) => s.loadCurrentCashOpen);

  useEffect(() => {
    if (company) setCurrentCompany(company);
  }, [company, setCurrentCompany]);

  useEffect(() => {
    loadCurrentCashOpen();
  }, [loadCurrentCashOpen]);
}
