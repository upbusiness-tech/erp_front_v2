import { Route, Routes } from "react-router-dom";
import { loginBaseRoutes } from "./Login/routes";

export const UnauthenticatedRoutes = () => {
  return (
    <Routes>
      {loginBaseRoutes.map((route) => (
        <Route path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
