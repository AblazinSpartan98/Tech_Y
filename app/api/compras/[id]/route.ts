import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    console.log("Fetching purchase details for ID:", id)

    // First, let's check if the ticket exists with a simple query
    const checkQuery = "SELECT ID FROM Ticket_Compra WHERE ID = ?"
    const checkResult = await executeQuery(checkQuery, [id])

    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      console.log("Purchase ticket not found with ID:", id)
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 })
    }

    console.log("Purchase ticket found, fetching details")

    // Obtener información del ticket con queries simples
    const ticketQuery = `
      SELECT 
        tc.ID,
        tc.Fecha,
        tc.ID_Proveedor,
        tc.DNI_Empleado,
        tc.ID_Metodo_Pago
      FROM Ticket_Compra tc
      WHERE tc.ID = ?
    `
    const ticketResult = await executeQuery(ticketQuery, [id])

    if (!Array.isArray(ticketResult) || ticketResult.length === 0) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 })
    }

    const ticket = ticketResult[0]
    console.log("Basic purchase info:", ticket)

    // Get proveedor info
    const proveedorQuery = "SELECT `Nombre de la empresa` FROM Proveedor WHERE ID = ?"
    const proveedorResult = await executeQuery(proveedorQuery, [ticket.ID_Proveedor])
    const proveedor =
      Array.isArray(proveedorResult) && proveedorResult.length > 0
        ? proveedorResult[0]["Nombre de la empresa"]
        : "Proveedor no encontrado"

    // Get empleado info
    const empleadoQuery = "SELECT Nombre, `Apellido Paterno`, `Apellido Materno` FROM Empleado WHERE DNI = ?"
    const empleadoResult = await executeQuery(empleadoQuery, [ticket.DNI_Empleado])
    const empleado =
      Array.isArray(empleadoResult) && empleadoResult.length > 0
        ? `${empleadoResult[0].Nombre} ${empleadoResult[0]["Apellido Paterno"]} ${empleadoResult[0]["Apellido Materno"]}`
        : "Empleado no encontrado"

    // Get metodo pago info
    const metodoQuery = "SELECT Tipo FROM Metodo_Pago WHERE ID = ?"
    const metodoResult = await executeQuery(metodoQuery, [ticket.ID_Metodo_Pago])
    const metodoPago =
      Array.isArray(metodoResult) && metodoResult.length > 0 ? metodoResult[0].Tipo : "Método de pago no encontrado"

    // Obtener detalles del ticket
    const detallesQuery = `
      SELECT 
        dc.Codigo_Producto,
        p.\`Nombre del producto\` as Nombre_Producto,
        dc.Cantidad,
        dc.\`Precio unitario\` as Precio_Unitario,
        (dc.Cantidad * dc.\`Precio unitario\`) as Subtotal
      FROM Detalle_Compra dc
      JOIN Producto p ON dc.Codigo_Producto = p.Codigo
      WHERE dc.ID_Ticket_Compra = ?
    `
    const detalles = await executeQuery(detallesQuery, [id])
    console.log("Purchase details found:", detalles ? (detalles as any[]).length : 0)

    // Calcular total
    const total = Array.isArray(detalles) ? detalles.reduce((sum, item) => sum + item.Subtotal, 0) : 0

    return NextResponse.json({
      ID: ticket.ID,
      Fecha: ticket.Fecha,
      Proveedor: proveedor,
      Empleado: empleado,
      Metodo_Pago: metodoPago,
      Total: total,
      Detalles: detalles || [],
    })
  } catch (error) {
    console.error("Error al obtener detalles de la compra:", error)
    return NextResponse.json(
      {
        message: "Error al obtener detalles de la compra",
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
