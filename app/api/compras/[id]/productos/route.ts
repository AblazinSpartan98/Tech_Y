import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const { codigoProducto, nombreProducto, cantidad, precioUnitario } = await request.json()

    // Validar datos
    if (!codigoProducto || !nombreProducto || !cantidad || !precioUnitario) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    // Verificar que el ticket existe
    const checkQuery = "SELECT ID FROM Ticket_Compra WHERE ID = ?"
    const checkResult = await executeQuery(checkQuery, [id])

    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      return NextResponse.json({ message: "Ticket de compra no encontrado" }, { status: 404 })
    }

    // Calcular subtotal
    const subtotal = cantidad * precioUnitario

    // Insertar detalle de compra
    const insertQuery = `
      INSERT INTO Detalle_Compra (
        ID_Ticket_Compra, 
        Codigo_Producto, 
        Nombre_Producto, 
        Cantidad, 
        Precio_unitario, 
        Subtotal
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
    await executeQuery(insertQuery, [id, codigoProducto, nombreProducto, cantidad, precioUnitario, subtotal])

    // Actualizar el total del ticket
    const updateTotalQuery = `
      UPDATE Ticket_Compra 
      SET Total = (
        SELECT SUM(Subtotal) 
        FROM Detalle_Compra 
        WHERE ID_Ticket_Compra = ?
      )
      WHERE ID = ?
    `
    await executeQuery(updateTotalQuery, [id, id])

    // Actualizar el inventario del producto
    const updateInventoryQuery = `
      UPDATE Producto 
      SET Cantidad = Cantidad + ? 
      WHERE Codigo = ?
    `
    await executeQuery(updateInventoryQuery, [cantidad, codigoProducto])

    return NextResponse.json({
      message: "Producto agregado correctamente",
      ticketId: id,
    })
  } catch (error) {
    console.error("Error al agregar producto a la compra:", error)
    return NextResponse.json(
      {
        message: "Error al agregar producto a la compra",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
