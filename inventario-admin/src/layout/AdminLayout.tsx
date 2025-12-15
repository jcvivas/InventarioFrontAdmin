import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "@/auth/auth";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

function NavItem({ to, label }: { to: string; label: string }): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 text-sm transition",
          isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        ].join(" ")
      }
      end={false}
    >
      {label}
    </NavLink>
  );
}

function Sidebar(): JSX.Element {
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r bg-white">
      <div className="p-4">
        <div className="text-base font-semibold">Inventario Admin</div>
        <div className="text-xs text-slate-500">Panel de administración</div>
      </div>

      <Separator />

      <nav className="p-3 space-y-1">
        <NavItem to="/categorias" label="Categorías" />
        <NavItem to="/proveedores" label="Proveedores" />
        <NavItem to="/productos" label="Productos" />
        <NavItem to="/ofertas" label="Ofertas" />
        <NavItem to="/movimientos" label="Movimientos" />
      </nav>
    </aside>
  );
}

export default function AdminLayout(): JSX.Element {
  const navigate = useNavigate();

  const logout = (): void => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        Menú
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72">
                      <div className="mb-4">
                        <div className="text-base font-semibold">Inventario Admin</div>
                        <div className="text-xs text-slate-500">Panel de administración</div>
                      </div>
                      <Separator />
                      <div className="mt-3 space-y-1">
                        <NavItem to="/categorias" label="Categorías" />
                        <NavItem to="/proveedores" label="Proveedores" />
                        <NavItem to="/productos" label="Productos" />
                        <NavItem to="/ofertas" label="Ofertas" />
                        <NavItem to="/movimientos" label="Movimientos" />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="text-sm text-slate-600">
                  Administración de inventario
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
