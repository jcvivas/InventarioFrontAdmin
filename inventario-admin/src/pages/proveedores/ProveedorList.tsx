import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import {
  getProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from "@/api/proveedor.api";
import type { ProveedorDto } from "@/types/proveedor.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type FormState = {
  idProveedor: number | null;
  codigo: string;
  nombre: string;
  identificacion: string;
  correo: string;
  telefono: string;
  activo: boolean;
};

const emptyForm: FormState = {
  idProveedor: null,
  codigo: "",
  nombre: "",
  identificacion: "",
  correo: "",
  telefono: "",
  activo: true
};

export default function ProveedorList(): JSX.Element {
  const [rows, setRows] = useState<ProveedorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const data = await getProveedores(texto.trim() || undefined);
      setRows(data);
    } catch {
      setError("No se pudieron cargar los proveedores.");
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

  const openEdit = (r: ProveedorDto): void => {
    setForm({
      idProveedor: r.idProveedor,
      codigo: r.codigo ?? "",
      nombre: r.nombre ?? "",
      identificacion: r.identificacion ?? "",
      correo: r.correo ?? "",
      telefono: r.telefono ?? "",
      activo: r.activo
    });
    setOpen(true);
  };

  const onSave = async (): Promise<void> => {
    setError(null);

    const payload = {
      codigo: form.codigo.trim() || null,
      nombre: form.nombre.trim() || null,
      identificacion: form.identificacion.trim() || null,
      correo: form.correo.trim() || null,
      telefono: form.telefono.trim() || null,
      activo: form.activo
    };

    if (!payload.nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    setBusy(true);
    try {
      if (form.idProveedor === null) {
        await crearProveedor(payload);
      } else {
        await actualizarProveedor({ idProveedor: form.idProveedor, ...payload });
      }
      setOpen(false);
      await load();
    } catch {
      setError("No se pudo guardar el proveedor.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (idProveedor: number): Promise<void> => {
    if (!confirm("¿Eliminar proveedor? (eliminación lógica)")) return;

    setError(null);
    setBusy(true);
    try {
      await eliminarProveedor(idProveedor);
      await load();
    } catch {
      setError("No se pudo eliminar el proveedor.");
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
            No hay proveedores
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(r => (
      <TableRow key={r.idProveedor}>
        <TableCell className="font-mono text-xs">{r.idProveedor}</TableCell>
        <TableCell>{r.codigo ?? "-"}</TableCell>
        <TableCell>{r.nombre ?? "-"}</TableCell>
        <TableCell>{r.correo ?? "-"}</TableCell>
        <TableCell>
          <span className={r.activo ? "text-foreground" : "text-muted-foreground"}>
            {r.activo ? "Sí" : "No"}
          </span>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(r)} disabled={busy}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => void onDelete(r.idProveedor)} disabled={busy}>
            Eliminar
          </Button>
        </TableCell>
      </TableRow>
    ));
  }, [busy, loading, rows]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proveedores</CardTitle>

          <div className="flex items-center gap-2">
            <Input
              className="w-64"
              placeholder="Buscar por código o nombre..."
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
                  <DialogTitle>
                    {form.idProveedor === null ? "Nuevo proveedor" : "Editar proveedor"}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input id="codigo" value={form.codigo} onChange={e => setForm(s => ({ ...s, codigo: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" value={form.nombre} onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identificacion">Identificación</Label>
                    <Input id="identificacion" value={form.identificacion} onChange={e => setForm(s => ({ ...s, identificacion: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo</Label>
                    <Input id="correo" value={form.correo} onChange={e => setForm(s => ({ ...s, correo: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input id="telefono" value={form.telefono} onChange={e => setForm(s => ({ ...s, telefono: e.target.value }))} />
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="text-sm font-medium">Activo</div>
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
                  <TableHead>Correo</TableHead>
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
