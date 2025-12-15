import axios, { AxiosError } from "axios";
import { clearToken, getToken, isTokenExpired } from "@/auth/auth";

const api = axios.create({
  baseURL: "https://localhost:44394/api/v1",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
  const token = getToken();

  if (token) {
    if (isTokenExpired(token)) {
      clearToken();
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const url = String(err.config?.url ?? "");

    const isLoginCall = url.includes("/auth/login");

    if (status === 401 && !isLoginCall) {
      clearToken();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
