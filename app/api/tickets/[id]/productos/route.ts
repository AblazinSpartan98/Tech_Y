import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession } from "@/app/actions/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("=== POST /api/tickets/[id]/productos - Iniciando ===")

    // Verificar sesión
    const session = await getSession()
    if (!session) {
      console.log("❌ No hay sesión activa")
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    const id = params.id
    console.log(`📋 ID del ticket: ${id}`)

    let body
    try {
      body = await request.json()
      console.log("📦 Datos recibidos:", body)
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Datos JSON inválidos",
        },
        { status: 400 },
      )
    }

    const { codigoProducto, cantidad } = body

    // Validar datos
    if (!codigoProducto || !cantidad || cantidad <= 0) {
      console.log("❌ Datos incompletos o inválidos:", { codigoProducto, cantidad })
      return NextResponse.json(
        {
          success: false,
          message: "Código de producto y cantidad válida son requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar que el ticket existe
    console.log("🔍 Verificando existencia del ticket...")
    const checkTicketQuery = "SELECT ID FROM Ticket_Venta WHERE ID = ?"
    const ticketResult = await executeQuery(checkTicketQuery, [id])

    if (!Array.isArray(ticketResult) || ticketResult.length === 0) {
      console.log("❌ Ticket no encontrado")
      return NextResponse.json(
        {
          success: false,
          message: `Ticket con ID ${id} no encontrado`,
        },
        { status: 404 },
      )
    }

    // Obtener información del producto
    console.log("🔍 Obteniendo información del producto...")
    const productQuery = "SELECT * FROM Producto WHERE Codigo = ?"
    const productResult = await executeQuery(productQuery, [codigoProducto])

    if (!Array.isArray(productResult) || productResult.length === 0) {
      console.log("❌ Producto no encontrado:", codigoProducto)
      return NextResponse.json(
        {
          success: false,
          message: `Producto con código ${codigoProducto} no encontrado`,
        },
        { status: 404 },
      )
    }

    const producto = productResult[0]
    console.log("✅ Producto encontrado:", producto)

    // Determinar el precio unitario
    let precioUnitario = 0
    if (producto["Precio unitario"] !== undefined) {
      precioUnitario = Number(producto["Precio unitario"])
    } else if (producto.Precio !== undefined) {
      precioUnitario = Number(producto.Precio)
    } else if (producto.precio !== undefined) {
      precioUnitario = Number(producto.precio)
    } else {
      console.log("❌ No se pudo determinar el precio del producto:", Object.keys(producto))
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo determinar el precio del producto",
        },
        { status: 500 },
      )
    }

    // Verificar stock disponible
    const stockDisponible = Number(producto.Cantidad) || 0
    if (stockDisponible < cantidad) {
      console.log(`❌ Stock insuficiente. Solicitado: ${cantidad}, Disponible: ${stockDisponible}`)
      return NextResponse.json(
        {
          success: false,
          message: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`,
        },
        { status: 400 },
      )
    }

    // Calcular subtotal
    const subtotal = cantidad * precioUnitario
    console.log(`💰 Subtotal calculado: ${subtotal} (${cantidad} x ${precioUnitario})`)

    // Verificar si el producto ya existe en el detalle de venta
    console.log("🔍 Verificando si el producto ya existe en el detalle...")
    const checkDetalleQuery = `
      SELECT ID, Cantidad FROM Detalle_Venta 
      WHERE ID_Ticket_Venta = ? AND Codigo_Producto = ?
    `
    const detalleResult = await executeQuery(checkDetalleQuery, [id, codigoProducto])

    if (Array.isArray(detalleResult) && detalleResult.length > 0) {
      // Actualizar detalle existente
      console.log("📝 Producto ya existe en el detalle, actualizando cantidad...")
      const updateQuery = `
        UPDATE Detalle_Venta 
        SET Cantidad = Cantidad + ?, 
            Subtotal = Subtotal + ? 
        WHERE ID_Ticket_Venta = ? AND Codigo_Producto = ?
      `
      await executeQuery(updateQuery, [cantidad, subtotal, id, codigoProducto])
    } else {
      // Insertar nuevo detalle
      console.log("➕ Insertando nuevo detalle de venta...")
      const insertQuery = `
        INSERT INTO Detalle_Venta (
          ID_Ticket_Venta, 
          Codigo_Producto, 
          Cantidad, 
          Precio_unitario, 
          Subtotal
        ) VALUES (?, ?, ?, ?, ?)
      `
      await executeQuery(insertQuery, [id, codigoProducto, cantidad, precioUnitario, subtotal])
    }

    // Actualizar el total del ticket
    console.log("💰 Actualizando total del ticket...")
    const updateTotalQuery = `
      UPDATE Ticket_Venta 
      SET Total = (
        SELECT COALESCE(SUM(Subtotal), 0)
        FROM Detalle_Venta 
        WHERE ID_Ticket_Venta = ?
      )
      WHERE ID = ?
    `
    await executeQuery(updateTotalQuery, [id, id])

    // Actualizar el inventario del producto
    console.log("📦 Actualizando inventario...")
    const updateInventoryQuery = `
      UPDATE Producto 
      SET Cantidad = Cantidad - ? 
      WHERE Codigo = ?
    `
    await executeQuery(updateInventoryQuery, [cantidad, codigoProducto])

    console.log("✅ Producto agregado correctamente al ticket")
    return NextResponse.json({
      success: true,
      message: "Producto agregado correctamente",
      data: {
        ticketId: id,
        codigoProducto,
        cantidad,
        precioUnitario,
        subtotal,
      },
    })
  } catch (error) {
    console.error("💥 Error al agregar producto al ticket:", error)

    // Determinar el tipo de error y devolver una respuesta apropiada
    let statusCode = 500
    let message = "Error interno del servidor"

    if (error instanceof Error) {
      message = error.message

      // Errores específicos de base de datos
      if (error.message.includes("ER_NO_SUCH_TABLE")) {
        statusCode = 500
        message = "Error de configuración de base de datos: tabla no encontrada"
      } else if (error.message.includes("ER_BAD_FIELD_ERROR")) {
        statusCode = 500
        message = "Error de configuración de base de datos: campo no encontrado"
      } else if (error.message.includes("ER_DUP_ENTRY")) {
        statusCode = 409
        message = "El producto ya existe en este ticket"
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: message,
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: statusCode },
    )
  }
}
