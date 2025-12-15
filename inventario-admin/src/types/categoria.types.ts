export interface CategoriaDto {
  idCategoria: number;
  nombre: string | null;
  activo: boolean;
}

export interface CategoriaCrearDto {
  nombre: string | null;
  activo: boolean;
}

export interface CategoriaActualizarDto extends CategoriaCrearDto {
  idCategoria: number;
}
