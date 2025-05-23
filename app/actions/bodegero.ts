"use server"

import { executeQuery } from "@/lib/db"
import { requireRole } from "./auth"
import { revalidatePath } from "next/cache"

// Obtener proveedores
export async function getProviders() {
  await requireRole(["bodegero", "admin"])

  try {
    const providers = await executeQuery("SELECT * FROM Proveedor ORDER BY `Nombre de la empresa` ASC")
    return { providers }
  } catch (error) {
    console.error("Error al obtener proveedores:", error)
    return { error: "No se pudieron cargar los proveedores" }
  }
}

// Obtener productos para comprar
export async function getProductsForPurchase() {
  await requireRole(["bodegero", "admin"])

  try {
    const products = await executeQuery("SELECT * FROM Producto ORDER BY `Nombre del producto` ASC")
    return { products }
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return { error: "No se pudieron cargar los productos" }
  }
}

// Crear un ticket de compra
export async function createPurchaseTicket(formData: FormData) {
  await requireRole(["bodegero", "admin"])

  // Obtener datos del formulario
  const providerId = formData.get("providerId")
  const paymentMethodId = formData.get("paymentMethodId")
  const purchaseItems = JSON.parse((formData.get("purchaseItems") as string) || "[]")

  if (!providerId || !paymentMethodId || purchaseItems.length === 0) {
    return { error: "Datos de compra incompletos" }
  }

  try {
    // 1. Obtener DNI del empleado (bodegero)
    const employeeResult = (await executeQuery("SELECT DNI FROM Empleado WHERE Puesto = ? LIMIT 1", [
      "Bodegero",
    ])) as any[]

    if (!employeeResult || employeeResult.length === 0) {
      return { error: "No se encontró un bodegero para asignar la compra" }
    }

    const dniEmpleado = employeeResult[0].DNI

    // 2. Crear el ticket de compra
    const ticketResult = (await executeQuery(
      "INSERT INTO Ticket_Compra (Fecha, ID_Proveedor, DNI_Empleado, ID_Metodo_Pago) VALUES (NOW(), ?, ?, ?)",
      [providerId, dniEmpleado, paymentMethodId],
    )) as any

    const ticketId = ticketResult.insertId

    // 3. Añadir los productos al detalle de compra
    for (const item of purchaseItems) {
      await executeQuery(
        "INSERT INTO Detalle_Compra (ID_Ticket_Compra, Nombre_Producto, Codigo_Producto, Cantidad, Precio_Unitario) VALUES (?, ?, ?, ?, ?)",
        [ticketId, item.nombre, item.codigo, item.cantidad, item.precioUnitario],
      )
    }

    revalidatePath("/bodegero/compras")
    return { success: true, ticketId }
  } catch (error) {
    console.error("Error al crear ticket de compra:", error)
    return { error: "No se pudo crear el ticket de compra" }
  }
}

// Obtener compras por proveedor
export async function getProviderPurchases(providerId: string) {
  await requireRole(["bodegero", "admin"])

  try {
    const purchases = await executeQuery(
      `SELECT tc.*, p.\`Nombre de la empresa\` as ProveedorNombre, 
       mp.\`Metodo de pago\` as MetodoPago
       FROM Ticket_Compra tc 
       JOIN Proveedor p ON tc.ID_Proveedor = p.ID
       JOIN \`Metodo de pago\` mp ON tc.ID_Metodo_Pago = mp.ID
       WHERE tc.ID_Proveedor = ? OR ? IS NULL
       ORDER BY tc.Fecha DESC`,
      [providerId, providerId],
    )

    return { purchases }
  } catch (error) {
    console.error("Error al obtener compras del proveedor:", error)
    return { error: "No se pudieron cargar las compras" }
  }
}

// Obtener detalles de compra
export async function getPurchaseDetails(id: string) {
  await requireRole(["bodegero", "admin"])

  try {
    const purchaseDetails = await executeQuery(
      `SELECT dc.* 
       FROM Detalle_Compra dc 
       WHERE dc.ID_Ticket_Compra = ?`,
      [id],
    )

    const purchaseInfo = await executeQuery(
      `SELECT tc.*, p.\`Nombre de la empresa\` as ProveedorNombre, 
       e.Nombre as EmpleadoNombre, mp.\`Metodo de pago\` as MetodoPago
       FROM Ticket_Compra tc 
       JOIN Proveedor p ON tc.ID_Proveedor = p.ID
       JOIN Empleado e ON tc.DNI_Empleado = e.DNI
       JOIN \`Metodo de pago\` mp ON tc.ID_Metodo_Pago = mp.ID
       WHERE tc.ID = ?`,
      [id],
    )

    return {
      details: purchaseDetails,
      purchase: purchaseInfo && purchaseInfo[0] ? purchaseInfo[0] : null,
    }
  } catch (error) {
    console.error("Error al obtener detalles de la compra:", error)
    return { error: "No se pudieron cargar los detalles de la compra" }
  }
}
