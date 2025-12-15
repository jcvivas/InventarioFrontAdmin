import api from "@/api/axios";
import type {
  CategoriaDto,
  CategoriaCrearDto,
  CategoriaActualizarDto
} from "@/types/categoria.types";

export const getCategorias = async (): Promise<CategoriaDto[]> => {
  const res = await api.get<CategoriaDto[]>("/admin/categorias");
  return res.data;
};

export const crearCategoria = async (
  data: CategoriaCrearDto
): Promise<void> => {
  await api.post("/admin/categorias", data);
};

export const actualizarCategoria = async (
  data: CategoriaActualizarDto
): Promise<void> => {
  await api.put("/admin/categorias", data);
};

export const eliminarCategoria = async (
  idCategoria: number
): Promise<void> => {
  await api.delete(`/admin/categorias/${idCategoria}`);
};
