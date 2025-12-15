import api from "@/api/axios";
import type { MovimientoInventarioDto } from "@/types/movimiento.types";

type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

export const getMovimientosByOferta = async (
  idProductoProveedorLote: number
): Promise<MovimientoInventarioDto[]> => {
  const res = await api.get<ApiResponse<MovimientoInventarioDto[]>>(
    `/admin/inventario/movimientos/${idProductoProveedorLote}`
  );

  if (!res.data?.isSuccess) {
    throw new Error(res.data?.message ?? "Consulta fallida.");
  }

  return Array.isArray(res.data?.data) ? res.data.data : [];
};
