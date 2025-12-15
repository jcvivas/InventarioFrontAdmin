import { useEffect, useMemo, useState } from "react";
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from "@/api/categoria.api";
import type { JSX } from "react";
import type { CategoriaDto } from "@/types/categoria.types";

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
  idCategoria: number | null;
  nombre: string;
  activo: boolean;
};

const emptyForm: FormState = { idCategoria: null, nombre: "", activo: true };

export default function CategoriaList(): JSX.Element {
  const [rows, setRows] = useState<CategoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = texto.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (r.nombre ?? "").toLowerCase().includes(q));
  }, [rows, texto]);

  const load = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const data = await getCategorias();
      setRows(data);
    } catch {
      setError("No se pudieron cargar las categorías.");
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

  const openEdit = (row: CategoriaDto): void => {
    setForm({
      idCategoria: row.idCategoria,
      nombre: row.nombre ?? "",
      activo: row.activo
    });
    setOpen(true);
  };

  const onSave = async (): Promise<void> => {
    setError(null);

    const nombre = form.nombre.trim();
    if (!nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    setBusy(true);
    try {
      if (form.idCategoria === null) {
        await crearCategoria({ nombre, activo: form.activo });
      } else {
        await actualizarCategoria({
          idCategoria: form.idCategoria,
          nombre,
          activo: form.activo
        });
      }

      setOpen(false);
      await load();
    } catch {
      setError("No se pudo guardar la categoría.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (idCategoria: number): Promise<void> => {
    const ok = confirm("¿Eliminar categoría? (eliminación lógica)");
    if (!ok) return;

    setError(null);
    setBusy(true);
    try {
      await eliminarCategoria(idCategoria);
      await load();
    } catch {
      setError("No se pudo eliminar la categoría.");
    } finally {
      setBusy(false);
    }
  };

  const tableBody = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell
            colSpan={4}
            className="py-10 text-center text-sm text-muted-foreground"
          >
            Cargando...
          </TableCell>
        </TableRow>
      );
    }

    if (filtered.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={4}
            className="py-10 text-center text-sm text-muted-foreground"
          >
            No hay categorías
          </TableCell>
        </TableRow>
      );
    }

    return filtered.map(r => (
      <TableRow key={r.idCategoria}>
        <TableCell className="font-mono text-xs">{r.idCategoria}</TableCell>
        <TableCell>{r.nombre ?? "-"}</TableCell>
        <TableCell>
          <span className={r.activo ? "text-foreground" : "text-muted-foreground"}>
            {r.activo ? "Sí" : "No"}
          </span>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEdit(r)}
            disabled={busy}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void onDelete(r.idCategoria)}
            disabled={busy}
          >
            Eliminar
          </Button>
        </TableCell>
      </TableRow>
    ));
  }, [busy, filtered, loading]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorías</CardTitle>

          <div className="flex items-center gap-2">
            <Input
              className="w-64"
              placeholder="Buscar por nombre..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>Nueva</Button>
              </DialogTrigger>

              <DialogContent className="bg-white text-slate-900 border border-slate-200 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {form.idCategoria === null ? "Nueva categoría" : "Editar categoría"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))}
                      placeholder="Ej: Electrónicos"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Activo</div>
                      
                    </div>

                    <Switch
                      checked={form.activo}
                      onCheckedChange={checked => setForm(s => ({ ...s, activo: checked }))}
                    />
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
                  <TableHead>Nombre</TableHead>
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
