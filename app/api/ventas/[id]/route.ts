import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Obtener datos del ticket
    const ticketData = (await executeQuery(
      `SELECT tv.*, c.Nombre as ClienteNombre, c.\`Apellido Paterno\` as ClienteApellido, 
       e.Nombre as EmpleadoNombre, mp.\`Metodo de pago\` as MetodoPago
       FROM Ticket_Venta tv 
       LEFT JOIN Cliente c ON tv.ID_Cliente = c.ID
       JOIN Empleado e ON tv.DNI_Empleado = e.DNI
       JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID
       WHERE tv.ID = ?`,
      [params.id],
    )) as any[]

    // Obtener detalles del ticket
    const detallesData = (await executeQuery(
      `SELECT dv.*, p.\`Nombre del producto\` as NombreProducto
       FROM Detalle_Venta dv 
       JOIN Producto p ON dv.Codigo_Producto = p.Codigo 
       WHERE dv.ID_Ticket_Venta = ?`,
      [params.id],
    )) as any[]

    return NextResponse.json({
      ticket: ticketData && ticketData.length > 0 ? ticketData[0] : null,
      detalles: detallesData,
    })
  } catch (error) {
    console.error("Error getting sale:", error)
    return NextResponse.json({ error: "Error al obtener la venta" }, { status: 500 })
  }
}
