import { useMemo, useState } from "react";
import type { JSX } from "react";

import { getMovimientosByOferta } from "@/api/movimiento.api";
import type { MovimientoInventarioDto } from "@/types/movimiento.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default function MovimientoPage(): JSX.Element {
  const [idOferta, setIdOferta] = useState("");
  const [rows, setRows] = useState<MovimientoInventarioDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idOfertaNumber = useMemo(() => Number(idOferta), [idOferta]);

  const canSearch = useMemo(() => {
    return Number.isInteger(idOfertaNumber) && idOfertaNumber > 0;
  }, [idOfertaNumber]);

  const buscar = async (): Promise<void> => {
    setError(null);

    if (!canSearch) {
      setRows([]);
      setError("Ingresa un ID válido (idProductoProveedorLote).");
      return;
    }

    setLoading(true);
    try {
      console.log("[Movimientos] buscando por idProductoProveedorLote =", idOfertaNumber);

      const data = await getMovimientosByOferta(idOfertaNumber);

      console.log("[Movimientos] response =", data);

      setRows(data);
    } catch (e) {
      console.error("[Movimientos] error =", e);
      setError("No se pudieron cargar los movimientos.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const body = useMemo(() => {
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
            Sin movimientos
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(m => (
      <TableRow key={String(m.idMovimiento)}>
        <TableCell className="font-mono text-xs">{m.idMovimiento}</TableCell>
        <TableCell>{m.tipoMovimiento ?? "-"}</TableCell>
        <TableCell className="text-right">{m.cantidad}</TableCell>
        <TableCell>{m.motivo ?? "-"}</TableCell>
        <TableCell>{m.referencia ?? "-"}</TableCell>
        <TableCell className="text-right">
          {new Date(m.fechaMovimientoUtc).toLocaleString()}
        </TableCell>
      </TableRow>
    ));
  }, [loading, rows]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Movimientos de inventario</CardTitle>
            <div className="text-xs text-muted-foreground">
              Resultados: {rows.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              className="w-72"
              placeholder="ID Oferta (idProductoProveedorLote)"
              value={idOferta}
              onChange={e => setIdOferta(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") void buscar();
              }}
            />
            <Button onClick={() => void buscar()} disabled={!canSearch || loading}>
              Buscar
            </Button>
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
                  <TableHead className="w-[120px]">Id</TableHead>
                  <TableHead className="w-[160px]">Tipo</TableHead>
                  <TableHead className="w-[120px] text-right">Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="w-[220px] text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{body}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
