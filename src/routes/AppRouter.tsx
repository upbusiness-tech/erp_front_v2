import { BrowserRouter } from "react-router-dom";
import { UnauthenticatedRoutes } from "@/routes/UnauthenticatedRoutes";
import { AuthenticatedRoutes } from "@/routes/AuthenticatedRoutes";
import { AuthGuard } from "@/routes/AuthGuard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <UnauthenticatedRoutes />
      <AuthGuard>
        <AuthenticatedRoutes />
      </AuthGuard>
    </BrowserRouter>
  );
}
