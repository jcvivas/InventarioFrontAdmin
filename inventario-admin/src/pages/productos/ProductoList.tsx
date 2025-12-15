import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import { getCategorias } from "@/api/categoria.api";
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from "@/api/producto.api";

import type { CategoriaDto } from "@/types/categoria.types";
import type { ProductoDto } from "@/types/producto.types";

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
  idProducto: number | null;
  codigo: string;
  nombre: string;
  descripcion: string;
  marca: string;
  idCategoria: number | null;
  urlImagen: string;
  activo: boolean;
};

const emptyForm: FormState = {
  idProducto: null,
  codigo: "",
  nombre: "",
  descripcion: "",
  marca: "",
  idCategoria: null,
  urlImagen: "",
  activo: true
};

export default function ProductoList(): JSX.Element {
  const [rows, setRows] = useState<ProductoDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const categoriasMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categorias) m.set(c.idCategoria, c.nombre ?? `#${c.idCategoria}`);
    return m;
  }, [categorias]);

  const load = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getCategorias(),
        getProductos(texto.trim() || undefined)
      ]);

      setCategorias(cats.filter(c => c.activo));
      setRows(prods);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = (): void => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: ProductoDto): void => {
    setForm({
      idProducto: r.idProducto,
      codigo: r.codigo ?? "",
      nombre: r.nombre ?? "",
      descripcion: r.descripcion ?? "",
      marca: r.marca ?? "",
      idCategoria: r.idCategoria ?? null,
      urlImagen: r.urlImagen ?? "",
      activo: r.activo
    });
    setOpen(true);
  };

  const onSave = async (): Promise<void> => {
    setError(null);

    const payload = {
      codigo: form.codigo.trim() || null,
      nombre: form.nombre.trim() || null,
      descripcion: form.descripcion.trim() || null,
      marca: form.marca.trim() || null,
      idCategoria: form.idCategoria,
      urlImagen: form.urlImagen.trim() || null,
      activo: form.activo
    };

    if (!payload.nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    setBusy(true);
    try {
      if (form.idProducto === null) {
        await crearProducto(payload);
      } else {
        await actualizarProducto({ idProducto: form.idProducto, ...payload });
      }
      setOpen(false);
      await load();
    } catch {
      setError("No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (idProducto: number): Promise<void> => {
    if (!confirm("¿Eliminar producto? (eliminación lógica)")) return;

    setError(null);
    setBusy(true);
    try {
      await eliminarProducto(idProducto);
      await load();
    } catch {
      setError("No se pudo eliminar el producto.");
    } finally {
      setBusy(false);
    }
  };

  const tableBody = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
            Cargando...
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
            No hay productos
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(r => (
      <TableRow key={r.idProducto}>
        <TableCell className="font-mono text-xs">{r.idProducto}</TableCell>
        <TableCell>{r.codigo ?? "-"}</TableCell>
        <TableCell className="font-medium">{r.nombre ?? "-"}</TableCell>
        <TableCell>{r.idCategoria ? (categoriasMap.get(r.idCategoria) ?? `#${r.idCategoria}`) : "-"}</TableCell>
        <TableCell>
          <span className={r.activo ? "text-foreground" : "text-muted-foreground"}>
            {r.activo ? "Sí" : "No"}
          </span>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(r)} disabled={busy}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => void onDelete(r.idProducto)} disabled={busy}>
            Eliminar
          </Button>
        </TableCell>
      </TableRow>
    ));
  }, [busy, categoriasMap, loading, rows]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>

          <div className="flex items-center gap-2">
            <Input
              className="w-64"
              placeholder="Buscar por nombre/código..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") void load();
              }}
            />
            <Button variant="outline" onClick={() => void load()} disabled={busy}>
              Buscar
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>Nuevo</Button>
              </DialogTrigger>

              <DialogContent className="bg-white text-slate-900 border border-slate-200 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>{form.idProducto === null ? "Nuevo producto" : "Editar producto"}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Codigo</Label>
                      <Input id="codigo" value={form.codigo} onChange={e => setForm(s => ({ ...s, codigo: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca</Label>
                      <Input id="marca" value={form.marca} onChange={e => setForm(s => ({ ...s, marca: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" value={form.nombre} onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={form.idCategoria ? String(form.idCategoria) : "0"}
                      onValueChange={v => setForm(s => ({ ...s, idCategoria: v === "0" ? null : Number(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin categoria</SelectItem>
                        {categorias.map(c => (
                          <SelectItem key={c.idCategoria} value={String(c.idCategoria)}>
                            {c.nombre ?? `#${c.idCategoria}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripcion</Label>
                    <Input id="descripcion" value={form.descripcion} onChange={e => setForm(s => ({ ...s, descripcion: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urlImagen">URL Imagen</Label>
                    <Input id="urlImagen" value={form.urlImagen} onChange={e => setForm(s => ({ ...s, urlImagen: e.target.value }))} />
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
                  <Button onClick={() => void onSave()} disabled={busy}>
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
                  <TableHead className="w-[90px]">ID</TableHead>
                  <TableHead className="w-[140px]">Codigo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[220px]">Categoria</TableHead>
                  <TableHead className="w-[120px]">Activo</TableHead>
                  <TableHead className="w-[180px] text-right">Acciones</TableHead>
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
