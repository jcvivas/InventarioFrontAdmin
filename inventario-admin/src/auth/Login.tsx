import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { setToken } from "@/auth/auth";
import { getErrorMessage } from "@/utils/errorUtils";
import type { ApiResponse } from "@/types/common";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JSX } from "react";

type LocationState = { from?: string };

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const goTo = state?.from ?? "/";

  const [correo, setCorreo] = useState("admin@admin");
  const [contrasena, setContrasena] = useState("123456");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    return loading || correo.trim().length === 0 || contrasena.trim().length === 0;
  }, [correo, contrasena, loading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<ApiResponse<string>>("/auth/login", {
        correo: correo.trim(),
        contrasena
      });

      if (!res.data.isSuccess || !res.data.data) {
        throw new Error(res.data.message || "No se pudo iniciar sesión.");
      }

      setToken(res.data.data);
      navigate(goTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Credenciales inválidas"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white shadow-lg shadow-slate-200/70">
          <div className="px-8 pt-8">
            <h1 className="text-center text-2xl font-bold text-slate-900">
              Iniciar Sesion
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              Adminitrcion de inventario
            </p>

            {error && (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="correo" className="block text-sm font-medium text-slate-700">
                  Correo
                </label>
                <Input
                  id= "correo"
                  type=  "email"
                  value={ correo}
                  onChange={e => setCorreo( e.target.value)}
                  placeholder= "correo@correo"
                  disabled={ loading }
                  autoComplete = "username"
                  className = "h-11   bg-white  text-slate-900 placeholder:text-slate-400"
                />
              </div>

            <div className="space-y-2">
                <label  htmlFor= "contrasena" className="block  text-sm  font-medium text-slate-700">
                  Contrasenia
                </label>
                <Input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  disabled={ loading }
                  autoComplete = "current-password"
                  className = "h-11 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <Button type= "submit" className="h-11 w-full" disabled={disabled}>
                {loading ?  "Ingresando...." : "Iniciar sesión"}
              </Button>

              <div className="pb-8" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
