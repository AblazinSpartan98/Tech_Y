"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Users,
  Package,
  Clipboard,
  LogOut,
  Database,
  Home,
  Warehouse,
  ShoppingBag,
  Building,
  History,
  User,
} from "lucide-react"
import type { JSX } from "react"

type NavItem = {
  title: string
  href: string
  icon: JSX.Element
}

type MainNavProps = {
  role: string
  userName?: string
  userId?: string
}

export function MainNav({ role, userName, userId }: MainNavProps) {
  const pathname = usePathname()

  // Definir navegación según el rol
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "admin":
        return [
          { title: "Dashboard", href: "/admin", icon: <Home className="mr-2 h-4 w-4" /> },
          { title: "Empleados", href: "/admin/empleados", icon: <Users className="mr-2 h-4 w-4" /> },
          { title: "Productos", href: "/admin/productos", icon: <Package className="mr-2 h-4 w-4" /> },
          { title: "Clientes", href: "/admin/clientes", icon: <Users className="mr-2 h-4 w-4" /> },
          { title: "Tickets Venta", href: "/admin/tickets", icon: <Clipboard className="mr-2 h-4 w-4" /> },
          { title: "Tickets Compra", href: "/admin/compras", icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
          { title: "Ver Tablas", href: "/admin/tablas", icon: <Database className="mr-2 h-4 w-4" /> },
        ]
      case "cajero":
        return [
          { title: "Dashboard", href: "/cajero", icon: <Home className="mr-2 h-4 w-4" /> },
          { title: "Clientes", href: "/cajero/clientes", icon: <Users className="mr-2 h-4 w-4" /> },
          { title: "Carrito", href: "/cajero/carrito", icon: <ShoppingCart className="mr-2 h-4 w-4" /> },
          { title: "Ventas", href: "/cajero/ventas", icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
        ]
      case "bodegero":
        return [
          { title: "Dashboard", href: "/bodegero", icon: <Home className="mr-2 h-4 w-4" /> },
          { title: "Compras", href: "/bodegero/compras", icon: <Warehouse className="mr-2 h-4 w-4" /> },
          { title: "Productos", href: "/bodegero/productos", icon: <Package className="mr-2 h-4 w-4" /> },
          { title: "Proveedores", href: "/bodegero/proveedores", icon: <Building className="mr-2 h-4 w-4" /> },
        ]
      case "cliente":
        return [
          { title: "Inicio", href: "/", icon: <Home className="mr-2 h-4 w-4" /> },
          { title: "Productos", href: "/productos", icon: <Package className="mr-2 h-4 w-4" /> },
          { title: "Mis Compras", href: "/cliente/compras", icon: <History className="mr-2 h-4 w-4" /> },
          { title: "Mi Perfil", href: "/cliente/perfil", icon: <User className="mr-2 h-4 w-4" /> },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white border-b">
      <div className="px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold">Tech-Y</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-primary bg-gray-50"
                    : "text-gray-600"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex md:items-center md:space-x-2 mr-4">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {userName || userId} (
                {role === "admin"
                  ? "Administrador"
                  : role === "cajero"
                    ? "Cajero"
                    : role === "bodegero"
                      ? "Bodeguero"
                      : "Cliente"}
                )
              </span>
            </div>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="text-gray-600">
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-4 divide-x">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 text-xs ${
                pathname === item.href || pathname.startsWith(`${item.href}/`) ? "text-primary" : "text-gray-600"
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
