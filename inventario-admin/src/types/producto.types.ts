export type ProductoDto = {
  idProducto: number;
  codigo: string | null;
  nombre: string | null;
  descripcion: string | null;
  marca: string | null;
  idCategoria: number | null;
  urlImagen: string | null;
  activo: boolean;
};

export type ProductoCrearDto = {
  codigo: string | null;
  nombre: string | null;
  descripcion: string | null;
  marca: string | null;
  idCategoria: number | null;
  urlImagen: string | null;
  activo: boolean;
};

export type ProductoActualizarDto = ProductoCrearDto & {
  idProducto: number;
};
