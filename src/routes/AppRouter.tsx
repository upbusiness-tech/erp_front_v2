import { BrowserRouter } from "react-router-dom";
import { UnauthenticatedRoutes } from "@/routes/UnauthenticatedRoutes";
import { AuthenticatedRoutes } from "@/routes/AuthenticatedRoutes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <UnauthenticatedRoutes />
      <AuthenticatedRoutes />
    </BrowserRouter>
  );
}
