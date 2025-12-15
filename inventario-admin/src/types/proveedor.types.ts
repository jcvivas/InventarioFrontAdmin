export type ProveedorDto = {
  idProveedor: number;
  codigo?: string | null;
  nombre?: string | null;
  identificacion?: string | null;
  correo?: string | null;
  telefono?: string | null;
  activo: boolean;
};

export type ProveedorCrearDto = {
  codigo?: string | null;
  nombre?: string | null;
  identificacion?: string | null;
  correo?: string | null;
  telefono?: string | null;
  activo: boolean;
};

export type ProveedorActualizarDto = ProveedorCrearDto & {
  idProveedor: number;
};
