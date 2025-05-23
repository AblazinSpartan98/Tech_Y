"use server"

import { executeQuery } from "@/lib/db"
import { requireRole } from "./auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Esquema para validar datos de cliente
const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  direccion: z.string().optional(),
  telefono: z.string().min(1, "El teléfono es requerido"),
})

// Añadir un nuevo cliente
export async function addClient(formData: FormData) {
  await requireRole(["cajero", "admin"])

  const validatedFields = clienteSchema.safeParse({
    nombre: formData.get("nombre"),
    apellidoMaterno: formData.get("apellidoMaterno"),
    apellidoPaterno: formData.get("apellidoPaterno"),
    direccion: formData.get("direccion"),
    telefono: formData.get("telefono"),
  })

  if (!validatedFields.success) {
    return { error: "Los datos del cliente son inválidos" }
  }

  const { nombre, apellidoMaterno, apellidoPaterno, direccion, telefono } = validatedFields.data

  try {
    const result = (await executeQuery(
      "INSERT INTO Cliente (Nombre, `Apellido Materno`, `Apellido Paterno`, Direccion, Teléfono) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellidoMaterno, apellidoPaterno, direccion || null, telefono],
    )) as any

    revalidatePath("/cajero/clientes")
    return { success: true, clientId: result.insertId }
  } catch (error) {
    console.error("Error al añadir cliente:", error)
    return { error: "No se pudo añadir el cliente" }
  }
}

// Obtener todos los clientes
export async function getClients() {
  await requireRole(["cajero", "admin"])

  try {
    const clients = await executeQuery("SELECT * FROM Cliente ORDER BY Nombre ASC")
    return { clients }
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return { error: "No se pudieron cargar los clientes" }
  }
}

// Obtener productos disponibles
export async function getAvailableProducts() {
  await requireRole(["cajero", "admin", "bodegero"])

  try {
    const products = await executeQuery("SELECT * FROM Producto WHERE Cantidad > 0 ORDER BY `Nombre del producto` ASC")
    return { products }
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return { error: "No se pudieron cargar los productos" }
  }
}

// Obtener métodos de pago
export async function getPaymentMethods() {
  await requireRole(["cajero", "admin", "bodegero"])

  try {
    const methods = await executeQuery("SELECT * FROM `Metodo de pago`")
    return { methods }
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error)
    return { error: "No se pudieron cargar los métodos de pago" }
  }
}

// Añadir producto al carrito
export async function addToCart(product: any) {
  // El carrito se maneja en el lado del cliente
  return { success: true }
}

// Crear un ticket de venta
export async function createSalesTicket(formData: FormData) {
  const session = await requireRole(["cajero", "admin"])

  // Obtener datos del formulario
  const clientId = formData.get("clientId")
  const paymentMethodId = formData.get("paymentMethodId")
  const cartItems = JSON.parse((formData.get("cartItems") as string) || "[]")

  if (!paymentMethodId || cartItems.length === 0) {
    return { error: "Datos de venta incompletos" }
  }

  try {
    // 1. Obtener DNI del empleado (cajero)
    const employeeResult = (await executeQuery("SELECT DNI FROM Empleado WHERE Puesto = ? LIMIT 1", [
      "Cajero",
    ])) as any[]

    if (!employeeResult || employeeResult.length === 0) {
      return { error: "No se encontró un cajero para asignar la venta" }
    }

    const dniEmpleado = employeeResult[0].DNI

    // 2. Crear el ticket de venta
    const ticketResult = (await executeQuery(
      "INSERT INTO Ticket_Venta (Fecha, ID_Cliente, DNI_Empleado, ID_Metodo_Pago) VALUES (NOW(), ?, ?, ?)",
      [clientId || null, dniEmpleado, paymentMethodId],
    )) as any

    const ticketId = ticketResult.insertId

    // 3. Añadir los productos al detalle de venta
    for (const item of cartItems) {
      await executeQuery("INSERT INTO Detalle_Venta (ID_Ticket_Venta, Codigo_Producto, Cantidad) VALUES (?, ?, ?)", [
        ticketId,
        item.codigo,
        item.cantidad,
      ])
    }

    revalidatePath("/cajero/ventas")
    return { success: true, ticketId }
  } catch (error) {
    console.error("Error al crear ticket de venta:", error)
    return { error: "No se pudo crear el ticket de venta" }
  }
}

// Obtener tickets de venta por cliente
export async function getClientSales(clientId: string) {
  await requireRole(["cajero", "admin"])

  try {
    const sales = await executeQuery(
      `SELECT tv.*, c.Nombre as ClienteNombre, c.\`Apellido Paterno\` as ClienteApellido, 
       mp.\`Metodo de pago\` as MetodoPago
       FROM Ticket_Venta tv 
       LEFT JOIN Cliente c ON tv.ID_Cliente = c.ID
       JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID
       WHERE tv.ID_Cliente = ? OR ? IS NULL
       ORDER BY tv.Fecha DESC`,
      [clientId, clientId],
    )

    return { sales }
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error)
    return { error: "No se pudieron cargar las ventas" }
  }
}
