export type MovimientoInventarioDto = {
  idMovimiento: number; 
  idProductoProveedorLote: number;
  tipoMovimiento: string | null;
  cantidad: number;
  motivo: string | null;
  referencia: string | null;
  idUsuario: number | null;
  fechaMovimientoUtc: string; 
};
