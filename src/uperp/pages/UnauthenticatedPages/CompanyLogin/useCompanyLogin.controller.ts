import { LoginPaths } from "@/routes/UnauthenticatedRoutes/Login/routes";
import { AuthService } from "@/services/auth.service";
import { App } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const authService = new AuthService();

export function useCompanyLoginController() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLoginWithCompany = async (values: { email: string; password: string }) => {
    try {
      setIsSubmitting(true);
      await authService.loginCompany({ email: values.email, password: values.password });
      message.success("Empresa logada com sucesso! Redirecionando...");
      navigate(LoginPaths.EMPLOYEE_LOGIN);
    } catch (error) {
      console.error(error);
      message.error("Ocorreu um erro ao tentar entrar com a empresa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleLoginWithCompany,
    isSubmitting,
  };
}
