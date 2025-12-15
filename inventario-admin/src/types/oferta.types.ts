export type OfertaDto = {
  idProductoProveedorLote: number;
  idProducto: number;
  idProveedor: number;
  numeroLote: string | null;
  precioUnitario: number;
  stockDisponible: number;
  stockReservado: number;
  moneda: string | null;
  fechaVencimiento: string | null; 
  activo: boolean;
};

export type OfertaCrearDto = Omit<OfertaDto, "idProductoProveedorLote">;

export type OfertaActualizarDto = OfertaDto;
