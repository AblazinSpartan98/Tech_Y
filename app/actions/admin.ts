"use server"

import { executeQuery } from "@/lib/db"
import { requireRole } from "./auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Obtener todos los empleados
export async function getEmployees() {
  await requireRole(["admin"])

  try {
    const employees = await executeQuery("SELECT * FROM Empleado ORDER BY `Nombre` ASC")
    return { employees }
  } catch (error) {
    console.error("Error al obtener empleados:", error)
    return { error: "No se pudieron cargar los empleados" }
  }
}

// Esquema para validar datos de empleado
const employeeSchema = z.object({
  dni: z.string().min(1, "El DNI es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  puesto: z.string().min(1, "El puesto es requerido"),
  salario: z.string().min(1, "El salario es requerido"),
  fechaContratacion: z.string().min(1, "La fecha de contratación es requerida"),
})

// Añadir un nuevo empleado
export async function addEmployee(formData: FormData) {
  await requireRole(["admin"])

  const validatedFields = employeeSchema.safeParse({
    dni: formData.get("dni"),
    nombre: formData.get("nombre"),
    apellidoMaterno: formData.get("apellidoMaterno"),
    apellidoPaterno: formData.get("apellidoPaterno"),
    puesto: formData.get("puesto"),
    salario: formData.get("salario"),
    fechaContratacion: formData.get("fechaContratacion"),
  })

  if (!validatedFields.success) {
    return { error: "Los datos del empleado son inválidos" }
  }

  const { dni, nombre, apellidoMaterno, apellidoPaterno, puesto, salario, fechaContratacion } = validatedFields.data

  try {
    await executeQuery(
      "INSERT INTO Empleado (DNI, Nombre, `Apellido Materno`, `Apellido Paterno`, Puesto, Salario, `Fecha de contratacion`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [dni, nombre, apellidoMaterno, apellidoPaterno, puesto, Number.parseInt(salario), fechaContratacion],
    )

    revalidatePath("/admin/empleados")
    return { success: true }
  } catch (error) {
    console.error("Error al añadir empleado:", error)
    return { error: "No se pudo añadir el empleado" }
  }
}

// Dar de baja a un empleado (en este caso, eliminarlo)
export async function removeEmployee(dni: string) {
  await requireRole(["admin"])

  try {
    await executeQuery("DELETE FROM Empleado WHERE DNI = ?", [dni])

    revalidatePath("/admin/empleados")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar empleado:", error)
    return { error: "No se pudo eliminar el empleado" }
  }
}

// Obtener todos los productos
export async function getAllProducts() {
  await requireRole(["admin"])

  try {
    const products = await executeQuery("SELECT * FROM Producto ORDER BY `Nombre del producto` ASC")
    return { products }
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return { error: "No se pudieron cargar los productos" }
  }
}

// Esquema para validar datos de producto
const productSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  cantidad: z.string().min(1, "La cantidad es requerida"),
  precioUnitario: z.string().min(1, "El precio unitario es requerido"),
})

// Añadir un nuevo producto
export async function addProduct(formData: FormData) {
  await requireRole(["admin", "bodegero"])

  const validatedFields = productSchema.safeParse({
    codigo: formData.get("codigo"),
    nombre: formData.get("nombre"),
    cantidad: formData.get("cantidad"),
    precioUnitario: formData.get("precioUnitario"),
  })

  if (!validatedFields.success) {
    return { error: "Los datos del producto son inválidos" }
  }

  const { codigo, nombre, cantidad, precioUnitario } = validatedFields.data

  try {
    await executeQuery(
      "INSERT INTO Producto (Codigo, `Nombre del producto`, Cantidad, `Precio unitario`) VALUES (?, ?, ?, ?)",
      [codigo, nombre, Number.parseInt(cantidad), Number.parseInt(precioUnitario)],
    )

    revalidatePath("/admin/productos")
    revalidatePath("/bodegero/productos")
    return { success: true }
  } catch (error) {
    console.error("Error al añadir producto:", error)
    return { error: "No se pudo añadir el producto" }
  }
}

// Obtener todas las tablas
export async function getAllTables() {
  await requireRole(["admin"])

  try {
    const tables = (await executeQuery(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'Tech_Y'",
    )) as any[]

    const tableData: Record<string, any[]> = {}

    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME
      const data = await executeQuery(`SELECT * FROM \`${tableName}\` LIMIT 100`)
      tableData[tableName] = data
    }

    return { tables: tableData }
  } catch (error) {
    console.error("Error al obtener tablas:", error)
    return { error: "No se pudieron cargar las tablas" }
  }
}

// Ver productos en un ticket de cliente
export async function getTicketDetails(id: string) {
  await requireRole(["admin"])

  try {
    const ticketDetails = await executeQuery(
      `SELECT dv.*, p.\`Nombre del producto\` 
       FROM Detalle_Venta dv 
       JOIN Producto p ON dv.Codigo_Producto = p.Codigo 
       WHERE dv.ID_Ticket_Venta = ?`,
      [id],
    )

    const ticketInfo = await executeQuery(
      `SELECT tv.*, c.Nombre as ClienteNombre, c.\`Apellido Paterno\` as ClienteApellido, 
       e.Nombre as EmpleadoNombre, mp.\`Metodo de pago\` as MetodoPago
       FROM Ticket_Venta tv 
       LEFT JOIN Cliente c ON tv.ID_Cliente = c.ID
       JOIN Empleado e ON tv.DNI_Empleado = e.DNI
       JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID
       WHERE tv.ID = ?`,
      [id],
    )

    return {
      details: ticketDetails,
      ticket: ticketInfo && ticketInfo[0] ? ticketInfo[0] : null,
    }
  } catch (error) {
    console.error("Error al obtener detalles del ticket:", error)
    return { error: "No se pudieron cargar los detalles del ticket" }
  }
}
