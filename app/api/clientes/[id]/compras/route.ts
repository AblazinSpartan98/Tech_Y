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
    console.log("Fetching purchases for client ID:", id)

    // Check if client exists
    const clienteQuery = "SELECT ID FROM Cliente WHERE ID = ?"
    const clienteResult = await executeQuery(clienteQuery, [id])

    if (!Array.isArray(clienteResult) || clienteResult.length === 0) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    // Get client purchases
    const comprasQuery = `
      SELECT 
        tv.ID,
        tv.Fecha,
        mp.Tipo as Metodo_Pago,
        SUM(dv.Cantidad * dv.\`Precio unitario\`) as Total
      FROM Ticket_Venta tv
      JOIN Detalle_Venta dv ON tv.ID = dv.ID_Ticket_Venta
      JOIN Metodo_Pago mp ON tv.ID_Metodo_Pago = mp.ID
      WHERE tv.ID_Cliente = ?
      GROUP BY tv.ID
      ORDER BY tv.Fecha DESC
    `
    const compras = await executeQuery(comprasQuery, [id])
    console.log("Client purchases found:", compras ? (compras as any[]).length : 0)

    return NextResponse.json(compras || [])
  } catch (error) {
    console.error("Error fetching client purchases:", error)
    return NextResponse.json(
      {
        message: "Error al obtener las compras del cliente",
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
