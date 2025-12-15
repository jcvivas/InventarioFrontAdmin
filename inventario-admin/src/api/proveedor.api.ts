import api from "@/api/axios";
import type { ProveedorDto, ProveedorCrearDto, ProveedorActualizarDto } from "@/types/proveedor.types";

export const getProveedores = async (texto?: string): Promise<ProveedorDto[]> => {
  const res = await api.get<ProveedorDto[]>("/admin/proveedores", {
    params: texto ? { texto } : undefined
  });
  return res.data;
};

export const crearProveedor = async (data: ProveedorCrearDto): Promise<void> => {
  await api.post("/admin/proveedores", data);
};

export const actualizarProveedor = async (data: ProveedorActualizarDto): Promise<void> => {
  await api.put("/admin/proveedores", data);
};

export const eliminarProveedor = async (idProveedor: number): Promise<void> => {
  await api.delete(`/admin/proveedores/${idProveedor}`);
};
