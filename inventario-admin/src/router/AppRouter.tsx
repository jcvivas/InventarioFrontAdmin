import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/auth/Login";
import ProtectedRoute from "@/auth/ProtectedRoute";
import AdminLayout from "@/layout/AdminLayout";
import type { JSX } from "react";

import CategoriaList from "@/pages/categorias/CategoriaList";
import ProveedorList from "@/pages/proveedores/ProveedorList";
import ProductoList from "@/pages/productos/ProductoList";
import OfertaPage from "@/pages/ofertas/OfertaPage";
import MovimientoPage from "@/pages/movimiento/MovimientoPage";

export default function AppRouter(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="categorias" replace />} />
            <Route path="categorias" element={<CategoriaList />} />
            <Route path="proveedores" element={<ProveedorList />} />
            <Route path="productos" element={<ProductoList />} />
            <Route path="ofertas" element={<OfertaPage />} />
            <Route path="movimientos" element={<MovimientoPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
