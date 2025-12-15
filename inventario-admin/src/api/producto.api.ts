import api from "@/api/axios";
import type { ProductoDto, ProductoCrearDto, ProductoActualizarDto } from "@/types/producto.types";

export const getProductos = async (texto?: string): Promise<ProductoDto[]> => {
  const res = await api.get<ProductoDto[]>("/admin/productos", {
    params: texto ? { texto } : undefined
  });
  return res.data;
};

export const getProductoById = async (idProducto: number): Promise<ProductoDto> => {
  const res = await api.get<ProductoDto>(`/admin/productos/${idProducto}`);
  return res.data;
};

export const crearProducto = async (data: ProductoCrearDto): Promise<void> => {
  await api.post("/admin/productos", data);
};

export const actualizarProducto = async (data: ProductoActualizarDto): Promise<void> => {
  await api.put("/admin/productos", data);
};

export const eliminarProducto = async (idProducto: number): Promise<void> => {
  await api.delete(`/admin/productos/${idProducto}`);
};
