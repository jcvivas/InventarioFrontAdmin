import api from "@/api/axios";
import type { OfertaDto, OfertaCrearDto, OfertaActualizarDto } from "@/types/oferta.types";

export const getOfertaById = async (idProductoProveedorLote: number): Promise<OfertaDto> => {
  const res = await api.get<OfertaDto>(`/admin/ofertas/${idProductoProveedorLote}`);
  return res.data;
};

export const getOfertasByProducto = async (idProducto: number): Promise<OfertaDto[]> => {
  const res = await api.get<OfertaDto[]>(`/admin/ofertas/producto/${idProducto}`);
  return res.data;
};

export const crearOferta = async (data: OfertaCrearDto): Promise<void> => {
  await api.post("/admin/ofertas", data);
};

export const actualizarOferta = async (data: OfertaActualizarDto): Promise<void> => {
  await api.put("/admin/ofertas", data);
};

export const eliminarOferta = async (idProductoProveedorLote: number): Promise<void> => {
  await api.delete(`/admin/ofertas/${idProductoProveedorLote}`);
};
