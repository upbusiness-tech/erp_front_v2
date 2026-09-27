import { SalesPaths } from "@/routes/AuthenticatedRoutes/Sales/routes";
import { AuthService, AvaliableEmployee } from "@/services/auth.service";
import { App } from "antd";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const authService = new AuthService();
const EMPLOYEE_LOAD_ATTEMPTS = 3;
const EMPLOYEE_LOAD_BACKOFF_MS = 300;

function shouldRetryEmployeeLoad(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return true;
  }

  const status = error.response?.status;

  // Network errors and timeouts have no response. Authentication and other
  // client errors are definitive and should not result in duplicate calls.
  return status === undefined || status >= 500;
}

export function useEmployeeLoginController() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [avaliableEmployees, setAvaliableEmployees] = useState<AvaliableEmployee[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const isLoadingEmployeesRef = useRef(false);

  const loadAvaliableEmployeesToLogin = useCallback(async () => {
    if (isLoadingEmployeesRef.current) {
      return;
    }

    isLoadingEmployeesRef.current = true;
    if (isMountedRef.current) {
      setIsLoading(true);
      setLoadError(null);
    }

    try {
      for (let attempt = 1; attempt <= EMPLOYEE_LOAD_ATTEMPTS; attempt += 1) {
        try {
          const employees = await authService.getAvaliableEmployees();

          if (!employees || employees.length === 0) {
            if (isMountedRef.current) {
              setLoadError("Nenhum funcionário disponível. Verifique as permissões.");
            }
            return;
          }

          if (isMountedRef.current) {
            setAvaliableEmployees(employees);
          }
          return;
        } catch (error) {
          const canRetry = attempt < EMPLOYEE_LOAD_ATTEMPTS && shouldRetryEmployeeLoad(error);

          if (!canRetry) {
            if (isMountedRef.current) {
              setLoadError("Verifique sua conexão e tente novamente.");
            }
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, EMPLOYEE_LOAD_BACKOFF_MS * attempt));

          if (!isMountedRef.current) {
            return;
          }
        }
      }
    } finally {
      isLoadingEmployeesRef.current = false;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLoginWithEmployee = async (values: { username: string; password: string }) => {
    try {
      setIsSubmitting(true);
      await authService.loginEmployee(values);
      message.success("Funcionário logado com sucesso! Bem-vindo.");
      navigate(SalesPaths.COMMON_SALE);
    } catch (error) {
      console.error(error);
      message.error("Ocorreu um erro ao tentar entrar com o funcionário.");
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void loadAvaliableEmployeesToLogin();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadAvaliableEmployeesToLogin]);

  return {
    isLoading,
    avaliableEmployees,
    loadError,
    retryLoadAvaliableEmployees: loadAvaliableEmployeesToLogin,
    handleLoginWithEmployee,
    isSubmitting,
  };
}
