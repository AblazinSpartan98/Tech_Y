import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Obtener el token de la cookie
  const token = req.cookies.get("auth_token")?.value

  // Si no hay token y la ruta está protegida, redirigir al login
  if (!token && isProtectedRoute(req.nextUrl.pathname)) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay token, verificar permisos basados en la ruta
  // Nota: La verificación detallada del token se hará en las rutas protegidas
  if (token) {
    try {
      // Verificación básica de formato de token (sin decodificar completamente)
      const hasCorrectFormat = token.split(".").length === 3

      if (!hasCorrectFormat) {
        // Token con formato incorrecto, redirigir al login
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/login"
        redirectUrl.searchParams.set("error", "invalid_token")
        return NextResponse.redirect(redirectUrl)
      }

      // La verificación completa del token se realizará en las rutas protegidas
    } catch (error) {
      // Error al procesar el token, redirigir al login
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("error", "token_error")
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Función para verificar si una ruta está protegida
function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/(protected)") ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cajero") ||
    pathname.startsWith("/bodegero") ||
    pathname.startsWith("/cliente")
  )
}

// Especificar las rutas que deben ser protegidas por el middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cart",
    "/checkout",
    "/admin/:path*",
    "/cajero/:path*",
    "/bodegero/:path*",
    "/cliente/:path*",
  ],
}
