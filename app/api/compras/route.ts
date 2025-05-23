import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function GET(request: Request) {
  try {
    console.log("GET /api/compras - Starting request")

    // Simple query to test database connection
    const testQuery = "SELECT 1 as test"
    await executeQuery(testQuery, [])
    console.log("Database connection test successful")

    // Basic query to get all purchases
    const query = "SELECT * FROM Ticket_Compra"
    console.log("Executing purchase query:", query)

    const compras = await executeQuery(query, [])
    console.log("Purchases found:", compras ? (compras as any[]).length : 0)

    return NextResponse.json(compras || [])
  } catch (error) {
    console.error("Error in GET /api/compras:", error)
    return NextResponse.json(
      {
        error: "Error al obtener compras",
        detail: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { providerId, paymentMethodId, purchaseItems } = await request.json()

    // Validar datos
    if (
      !providerId ||
      !paymentMethodId ||
      !purchaseItems ||
      !Array.isArray(purchaseItems) ||
      purchaseItems.length === 0
    ) {
      return NextResponse.json({ message: "Datos de compra incompletos" }, { status: 400 })
    }

    // 1. Obtener DNI del empleado (bodegero o admin)
    const employeeResult = (await executeQuery("SELECT DNI FROM Empleado WHERE Puesto = ? OR Puesto = ? LIMIT 1", [
      "Bodegero",
      "Admin",
    ])) as any[]

    if (!employeeResult || employeeResult.length === 0) {
      return NextResponse.json({ message: "No se encontró un empleado para asignar la compra" }, { status: 400 })
    }

    const dniEmpleado = employeeResult[0].DNI

    // 2. Calcular el total
    const total = purchaseItems.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)

    // 3. Crear el ticket de compra
    const ticketResult = (await executeQuery(
      "INSERT INTO Ticket_Compra (Fecha, ID_Proveedor, DNI_Empleado, ID_Metodo_Pago, Total) VALUES (NOW(), ?, ?, ?, ?)",
      [providerId, dniEmpleado, paymentMethodId, total],
    )) as any

    const ticketId = ticketResult.insertId

    // 4. Añadir los productos al detalle de compra
    for (const item of purchaseItems) {
      const subtotal = item.cantidad * item.precioUnitario

      await executeQuery(
        "INSERT INTO Detalle_Compra (ID_Ticket_Compra, Codigo_Producto, Nombre_Producto, Cantidad, Precio_unitario, Subtotal) VALUES (?, ?, ?, ?, ?, ?)",
        [ticketId, item.codigo, item.nombre, item.cantidad, item.precioUnitario, subtotal],
      )

      // 5. Actualizar el inventario del producto
      await executeQuery("UPDATE Producto SET Cantidad = Cantidad + ? WHERE Codigo = ?", [item.cantidad, item.codigo])
    }

    return NextResponse.json({
      message: "Compra registrada correctamente",
      ticketId,
    })
  } catch (error) {
    console.error("Error al crear ticket de compra:", error)
    return NextResponse.json(
      {
        message: "Error al crear ticket de compra",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
