import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearToken, getToken, isTokenExpired } from "@/auth/auth";
import type { JSX } from "react";

export default function ProtectedRoute(): JSX.Element {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isTokenExpired(token)) {
    clearToken();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
