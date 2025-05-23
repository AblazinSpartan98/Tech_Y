import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { clienteId, metodoPagoId, productos } = data

    if (!clienteId || !metodoPagoId || !productos || productos.length === 0) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    for (const producto of productos) {
      const stockResult = await executeQuery("SELECT Cantidad FROM Producto WHERE Codigo = ?", [producto.codigo])

      if (!Array.isArray(stockResult) || stockResult.length === 0) {
        return NextResponse.json({ message: `Producto con código ${producto.codigo} no encontrado` }, { status: 404 })
      }

      const stock = stockResult[0].Cantidad
      if (stock < producto.cantidad) {
        return NextResponse.json({ message: `Stock insuficiente para el producto ${producto.codigo}` }, { status: 400 })
      }
    }

    await executeQuery("START TRANSACTION")

    try {
      const fecha = new Date().toISOString().slice(0, 19).replace("T", " ")
      const dniEmpleado = session.role === "cajero" ? session.id : "LGS4726151"

      const ticketResult = await executeQuery(
        "INSERT INTO Ticket_Venta (Fecha, ID_Cliente, DNI_Empleado, ID_Metodo_Pago) VALUES (?, ?, ?, ?)",
        [fecha, clienteId, dniEmpleado, metodoPagoId],
      )

      const ticketId = ticketResult.insertId

      for (const producto of productos) {
        await executeQuery("INSERT INTO Detalle_Venta (ID_Ticket_Venta, Codigo_Producto, Cantidad) VALUES (?, ?, ?)", [
          ticketId,
          producto.codigo,
          producto.cantidad,
        ])

        // Actualizar stock
        await executeQuery("UPDATE Producto SET Cantidad = Cantidad - ? WHERE Codigo = ?", [
          producto.cantidad,
          producto.codigo,
        ])
      }

      await executeQuery("COMMIT")

      return NextResponse.json({ success: true, ticketId })
    } catch (error) {
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error al procesar la venta:", error)
    return NextResponse.json({ message: "Error al procesar la venta" }, { status: 500 })
  }
}
