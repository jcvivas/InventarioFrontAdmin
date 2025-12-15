import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import { getProductos } from "@/api/producto.api";
import { getProveedores } from "@/api/proveedor.api";
import { getOfertasByProducto, crearOferta, actualizarOferta, eliminarOferta } from "@/api/oferta.api";

import type { ProductoDto } from "@/types/producto.types";
import type { ProveedorDto } from "@/types/proveedor.types";
import type { OfertaDto } from "@/types/oferta.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FormState = {
  idProductoProveedorLote: number | null;
  idProducto: number;
  idProveedor: number;
  numeroLote: string;
  precioUnitario: string;
  stockDisponible: string;
  stockReservado: string;
  moneda: string;
  fechaVencimiento: string; 
  activo: boolean;
};

const emptyForm = (idProducto: number): FormState => ({
  idProductoProveedorLote: null,
  idProducto,
  idProveedor: 0,
  numeroLote: "",
  precioUnitario: "0",
  stockDisponible: "0",
  stockReservado: "0",
  moneda: "USD",
  fechaVencimiento: "",
  activo: true
});

function toIsoOrNull(datetimeLocal: string): string | null {
  if (!datetimeLocal.trim()) return null;
  const d = new Date(datetimeLocal);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function OfertaPage(): JSX.Element {
  const [productos, setProductos] = useState<ProductoDto[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDto[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);

  const [rows, setRows] = useState<OfertaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(0));

  const productosMap = useMemo(() => new Map(productos.map(p => [p.idProducto, p.nombre ?? `#${p.idProducto}`])), [productos]);
  const proveedoresMap = useMemo(() => new Map(proveedores.map(p => [p.idProveedor, p.nombre ?? `#${p.idProveedor}`])), [proveedores]);

  const loadBase = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const [prods, provs] = await Promise.all([getProductos(), getProveedores()]);
      setProductos(prods.filter(p => p.activo));
      setProveedores(provs.filter(p => p.activo));

      const first = prods.find(p => p.activo)?.idProducto ?? null;
      setSelectedProductoId(first);
    } catch {
      setError("No se pudieron cargar productos/proveedores.");
    } finally {
      setLoading(false);
    }
  };

  const loadOfertas = async (idProducto: number): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const data = await getOfertasByProducto(idProducto);
      setRows(data);
    } catch {
      setError("No se pudieron cargar las ofertas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBase();
  }, []);

  useEffect(() => {
    if (selectedProductoId) void loadOfertas(selectedProductoId);
  }, [selectedProductoId]);

  const openCreate = (): void => {
    if (!selectedProductoId) return;
    setForm(emptyForm(selectedProductoId));
    setOpen(true);
  };

  const openEdit = (r: OfertaDto): void => {
    setForm({
      idProductoProveedorLote: r.idProductoProveedorLote,
      idProducto: r.idProducto,
      idProveedor: r.idProveedor,
      numeroLote: r.numeroLote ?? "",
      precioUnitario: String(r.precioUnitario ?? 0),
      stockDisponible: String(r.stockDisponible ?? 0),
      stockReservado: String(r.stockReservado ?? 0),
      moneda: r.moneda ?? "USD",
      fechaVencimiento: r.fechaVencimiento ? r.fechaVencimiento.slice(0, 16) : "",
      activo: r.activo
    });
    setOpen(true);
  };

  const onSave = async (): Promise<void> => {
    setError(null);

    if (!selectedProductoId) return;
    if (form.idProveedor <= 0) {
      setError("Seleccione un proveedor.");
      return;
    }

    const precio = Number(form.precioUnitario);
    const stockDisp = Number(form.stockDisponible);
    const stockRes = Number(form.stockReservado);

    if (Number.isNaN(precio) || precio < 0) {
      setError("Precio inválido.");
      return;
    }
    if (!Number.isInteger(stockDisp) || stockDisp < 0) {
      setError("Stock disponible inválido.");
      return;
    }
    if (!Number.isInteger(stockRes) || stockRes < 0) {
      setError("Stock reservado inválido.");
      return;
    }

    const payloadBase = {
      idProducto: form.idProducto,
      idProveedor: form.idProveedor,
      numeroLote: form.numeroLote.trim() || null,
      precioUnitario: precio,
      stockDisponible: stockDisp,
      stockReservado: stockRes,
      moneda: form.moneda.trim() || null,
      fechaVencimiento: toIsoOrNull(form.fechaVencimiento),
      activo: form.activo
    };

    setBusy(true);
    try {
      if (form.idProductoProveedorLote === null) {
        await crearOferta(payloadBase);
      } else {
        await actualizarOferta({ idProductoProveedorLote: form.idProductoProveedorLote, ...payloadBase });
      }

      setOpen(false);
      await loadOfertas(selectedProductoId);
    } catch {
      setError("No se pudo guardar la oferta.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (idProductoProveedorLote: number): Promise<void> => {
    if (!confirm("¿Eliminar oferta? (eliminación lógica)")) return;

    if (!selectedProductoId) return;

    setError(null);
    setBusy(true);
    try {
      await eliminarOferta(idProductoProveedorLote);
      await loadOfertas(selectedProductoId);
    } catch {
      setError("No se pudo eliminar la oferta.");
    } finally {
      setBusy(false);
    }
  };

  const tableBody = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
            Cargando...
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
            No hay ofertas para este producto
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(r => (
      <TableRow key={r.idProductoProveedorLote}>
        <TableCell className="font-mono text-xs">{r.idProductoProveedorLote}</TableCell>
        <TableCell>{proveedoresMap.get(r.idProveedor) ?? `#${r.idProveedor}`}</TableCell>
        <TableCell>{r.numeroLote ?? "-"}</TableCell>
        <TableCell className="text-right">{r.precioUnitario.toFixed(2)}</TableCell>
        <TableCell className="text-right">{r.stockDisponible}</TableCell>
        <TableCell>
          <span className={r.activo ? "text-foreground" : "text-muted-foreground"}>
            {r.activo ? "Sí" : "No"}
          </span>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(r)} disabled={busy}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => void onDelete(r.idProductoProveedorLote)} disabled={busy}>
            Eliminar
          </Button>
        </TableCell>
      </TableRow>
    ));
  }, [busy, loading, proveedoresMap, rows]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ofertas</CardTitle>

          <div className="flex items-center gap-2">
            <Select
              value={selectedProductoId ? String(selectedProductoId) : "0"}
              onValueChange={v => setSelectedProductoId(v === "0" ? null : Number(v))}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Seleccione un producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccione...</SelectItem>
                {productos.map(p => (
                  <SelectItem key={p.idProducto} value={String(p.idProducto)}>
                    {p.nombre ?? `#${p.idProducto}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} disabled={!selectedProductoId}>
                  Nueva
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-white text-slate-900 border border-slate-200 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {form.idProductoProveedorLote === null ? "Nueva oferta" : "Editar oferta"}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Input value={form.idProducto ? (productosMap.get(form.idProducto) ?? `#${form.idProducto}`) : ""} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Proveedor *</Label>
                    <Select
                      value={form.idProveedor > 0 ? String(form.idProveedor) : "0"}
                      onValueChange={v => setForm(s => ({ ...s, idProveedor: v === "0" ? 0 : Number(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Seleccione...</SelectItem>
                        {proveedores.map(p => (
                          <SelectItem key={p.idProveedor} value={String(p.idProveedor)}>
                            {p.nombre ?? `#${p.idProveedor}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="numeroLote">Num de lote</Label>
                      <Input id="numeroLote" value={form.numeroLote} onChange={e => setForm(s => ({ ...s, numeroLote: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moneda">Moneda</Label>
                      <Input id="moneda" value={form.moneda} onChange={e => setForm(s => ({ ...s, moneda: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="precio">Precio unitario</Label>
                      <Input id="precio" inputMode="decimal" value={form.precioUnitario} onChange={e => setForm(s => ({ ...s, precioUnitario: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stockDisp">Stock disponible</Label>
                      <Input id="stockDisp" inputMode="numeric" value={form.stockDisponible} onChange={e => setForm(s => ({ ...s, stockDisponible: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stockRes">Stock reservado</Label>
                      <Input id="stockRes" inputMode="numeric" value={form.stockReservado} onChange={e => setForm(s => ({ ...s, stockReservado: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaVenc">Fecha vencimiento</Label>
                    <Input
                      id="fechaVenc"
                      type="datetime-local"
                      value={form.fechaVencimiento}
                      onChange={e => setForm(s => ({ ...s, fechaVencimiento: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="text-sm font-medium">Activo</div>
                      <div className="text-xs text-muted-foreground">Eliminación lógica</div>
                    </div>
                    <Switch checked={form.activo} onCheckedChange={checked => setForm(s => ({ ...s, activo: checked }))} />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
                    Cancelar
                  </Button>
                  <Button onClick={() => void onSave()} disabled={busy || !selectedProductoId}>
                    {busy ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Id Oferta</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="w-[160px]">Lote</TableHead>
                  <TableHead className="w-[140px] text-right">Precio</TableHead>
                  <TableHead className="w-[160px] text-right">Stock disponibe</TableHead>
                  <TableHead className="w-[120px]">Activo</TableHead>
                  <TableHead className="w-[180px] text-right">Aciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{tableBody}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
