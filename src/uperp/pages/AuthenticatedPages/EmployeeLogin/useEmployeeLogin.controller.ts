import { SalesPaths } from "@/routes/AuthenticatedRoutes/Sales/routes";
import { AuthService, AvaliableEmployee } from "@/services/auth.service";
import { App } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const authService = new AuthService();

export function useEmployeeLoginController() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [avaliableEmployees, setAvaliableEmployees] = useState<AvaliableEmployee[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const loadAvaliableEmployeesToLogin = async () => {
    try {
      setIsLoading(true);
      const employees = await authService.getAvaliableEmployees();
      setAvaliableEmployees(employees);
    } catch (error) {
      message.error("Erro ao fazer login com o funcionário.");
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsSubmitting(true);
    }
  };

  useEffect(() => {
    loadAvaliableEmployeesToLogin();
  }, []);

  return {
    isLoading,
    avaliableEmployees,
    handleLoginWithEmployee,
    isSubmitting,
  };
}
