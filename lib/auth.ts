import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { executeQuery, getOne } from "./mysql"
import type { NextRequest } from "next/server"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_in_production")

export type UserRole = "admin" | "cajero" | "bodegero" | "cliente"

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: UserRole
}

export async function login(email: string, password: string) {
  try {
    // Primero intentamos buscar en la tabla de empleados
    const empleado = await getOne(
      "SELECT id_empleado as id, nombre, apellido, email, rol, password FROM Empleado WHERE email = ?",
      [email],
    )

    if (empleado && empleado.password === password) {
      return {
        success: true,
        user: {
          id: empleado.id,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          email: empleado.email,
          rol: empleado.rol as UserRole,
        },
      }
    }

    // Si no es un empleado, buscamos en la tabla de clientes
    const cliente = await getOne(
      "SELECT id_cliente as id, nombre, apellido, email, password FROM Cliente WHERE email = ?",
      [email],
    )

    if (cliente && cliente.password === password) {
      return {
        success: true,
        user: {
          id: cliente.id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          rol: "cliente" as UserRole,
        },
      }
    }

    return { success: false, error: "Credenciales inválidas" }
  } catch (error) {
    console.error("Error en login:", error)
    return { success: false, error: "Error en el servidor" }
  }
}

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

  const session = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(secretKey)

  cookies().set("session", session, {
    expires,
    httpOnly: true,
    path: "/",
  })

  return session
}

export async function getSession() {
  const session = cookies().get("session")?.value

  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, secretKey)
    return payload as User
  } catch (error) {
    return null
  }
}

export async function logout() {
  cookies().delete("session")
}

export async function register(userData: {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono: string
  direccion: string
}) {
  try {
    // Verificar si el email ya existe
    const existingUser = await getOne(
      "SELECT email FROM Cliente WHERE email = ? UNION SELECT email FROM Empleado WHERE email = ?",
      [userData.email, userData.email],
    )

    if (existingUser) {
      return { success: false, error: "El email ya está registrado" }
    }

    // Insertar nuevo cliente
    await executeQuery(
      "INSERT INTO Cliente (nombre, apellido, email, password, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)",
      [userData.nombre, userData.apellido, userData.email, userData.password, userData.telefono, userData.direccion],
    )

    return { success: true }
  } catch (error) {
    console.error("Error en registro:", error)
    return { success: false, error: "Error en el servidor" }
  }
}

export function getUserFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value

  if (!sessionCookie) return null

  try {
    const decoded = jwtVerify(sessionCookie, secretKey)
    return decoded
  } catch (error) {
    return null
  }
}

export async function getUserRole() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: user, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (error || !user) {
    return null
  }

  return user.role
}

export async function requireAuth() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  const role = await getUserRole()

  if (!role || !allowedRoles.includes(role)) {
    redirect("/dashboard")
  }

  return { session, role }
}
