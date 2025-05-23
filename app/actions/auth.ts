"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/db"

// Esquema de validación para inicio de sesión
const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  userType: z.enum(["cliente", "empleado"]).default("cliente"),
})

// Función para verificar credenciales
export async function login(formData: FormData) {
  try {
    const validatedFields = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
      userType: formData.get("userType") || "cliente",
    })

    if (!validatedFields.success) {
      return { error: "Credenciales inválidas" }
    }

    const { username, password, userType } = validatedFields.data

    let user = null
    let role = ""
    let userId: string | number = ""

    if (userType === "empleado") {
      // Verificar empleado usando DNI como usuario
      const empleados = await executeQuery(
        "SELECT DNI, Nombre, Puesto, Contra FROM Empleado WHERE DNI = ? AND Contra = ?",
        [username, password],
      )

      if (Array.isArray(empleados) && empleados.length > 0) {
        user = empleados[0]
        role = user.Puesto.toLowerCase()
        userId = user.DNI
      }
    } else {
      // Verificar cliente
      const clientes = await executeQuery(
        "SELECT ID, Nombre, Usuario, Contra FROM Cliente WHERE Usuario = ? AND Contra = ?",
        [username, password],
      )

      if (Array.isArray(clientes) && clientes.length > 0) {
        user = clientes[0]
        role = "cliente"
        userId = user.ID
      }
    }

    if (!user) {
      return { error: "Credenciales incorrectas" }
    }

    // Crear JWT token
    const token = jwt.sign(
      { id: userId, role: role, userType: userType },
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: "8h",
      },
    )

    // Guardar en cookies
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    })

    return { success: true, role, userId }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Error al iniciar sesión" }
  }
}

// Verificar sesión actual (solo se usa en server components y server actions, no en middleware)
export async function getSession() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return null
    }

    // Esta función solo se ejecuta en el servidor, no en Edge Runtime
    const verified = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as {
      id: number | string
      role: string
      userType: string
    }
    return verified
  } catch (error) {
    console.error("Error al verificar sesión:", error)
    return null
  }
}

// Función para cerrar sesión
export async function logout() {
  cookies().delete("auth_token")
  redirect("/")
}

// Proteger rutas basadas en rol
export async function requireRole(roles: string[]) {
  const session = await getSession()

  if (!session) {
    redirect("/login?error=unauthenticated")
  }

  if (!roles.includes(session.role)) {
    redirect("/login?error=unauthorized")
  }

  return session
}

// Obtener información del usuario actual
export async function getCurrentUser() {
  try {
    const session = await getSession()

    if (!session) {
      return null
    }

    if (session.userType === "empleado") {
      const empleados = await executeQuery("SELECT * FROM Empleado WHERE DNI = ?", [session.id])
      return Array.isArray(empleados) && empleados.length > 0 ? empleados[0] : null
    } else {
      const clientes = await executeQuery("SELECT * FROM Cliente WHERE ID = ?", [session.id])
      return Array.isArray(clientes) && clientes.length > 0 ? clientes[0] : null
    }
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return null
  }
}
