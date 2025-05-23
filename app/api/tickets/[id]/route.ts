import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Fetching ticket details for ID:", id)

    // Paso 1: Verificar conexión a la base de datos
    try {
      const testQuery = "SELECT 1 as test"
      const testResult = await executeQuery(testQuery)
      console.log("Database connection test:", testResult)
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json(
        { message: "Error de conexión a la base de datos", error: String(dbError) },
        { status: 500 },
      )
    }

    // Paso 2: Obtener información básica del ticket con JOIN a Cliente y Método de Pago
    try {
      const ticketQuery = `
        SELECT 
          tv.*,
          c.Nombre as Cliente_Nombre,
          c.\`Apellido Paterno\` as Cliente_Apellido_Paterno,
          c.\`Apellido Materno\` as Cliente_Apellido_Materno,
          c.Usuario as Cliente_Usuario,
          mp.\`Metodo de pago\` as Metodo_Pago_Nombre
        FROM Ticket_Venta tv
        LEFT JOIN Cliente c ON tv.ID_Cliente = c.ID
        LEFT JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID
        WHERE tv.ID = ?
      `
      const ticketResult = await executeQuery(ticketQuery, [id])
      console.log("Ticket query result:", ticketResult)

      if (!Array.isArray(ticketResult) || ticketResult.length === 0) {
        // Intentar con una consulta más simple si la anterior falla
        const simpleTicketQuery = `SELECT * FROM Ticket_Venta WHERE ID = ?`
        const simpleTicketResult = await executeQuery(simpleTicketQuery, [id])

        if (!Array.isArray(simpleTicketResult) || simpleTicketResult.length === 0) {
          return NextResponse.json({ message: `Ticket con ID ${id} no encontrado` }, { status: 404 })
        }

        console.log("Simple ticket query result:", simpleTicketResult)
        const ticket = simpleTicketResult[0] as any

        // Intentar obtener el cliente por separado
        let clienteNombre = `Cliente ID: ${ticket.ID_Cliente || "N/A"}`
        try {
          const clienteQuery = `SELECT Nombre, \`Apellido Paterno\`, \`Apellido Materno\`, Usuario FROM Cliente WHERE ID = ?`
          const clienteResult = await executeQuery(clienteQuery, [ticket.ID_Cliente])
          if (Array.isArray(clienteResult) && clienteResult.length > 0) {
            const cliente = clienteResult[0] as any
            if (cliente.Usuario) {
              clienteNombre = cliente.Usuario
            } else if (cliente.Nombre) {
              clienteNombre =
                `${cliente.Nombre} ${cliente["Apellido Paterno"] || ""} ${cliente["Apellido Materno"] || ""}`.trim()
            }
          }
        } catch (clienteError) {
          console.error("Error getting cliente:", clienteError)
        }

        // Intentar obtener el método de pago por separado
        let metodoPagoNombre = `Método ID: ${ticket.ID_Metodo_Pago || "N/A"}`
        try {
          const metodoPagoQuery = `SELECT \`Metodo de pago\` FROM \`Metodo de pago\` WHERE ID = ?`
          const metodoPagoResult = await executeQuery(metodoPagoQuery, [ticket.ID_Metodo_Pago])
          if (Array.isArray(metodoPagoResult) && metodoPagoResult.length > 0) {
            const metodoPago = metodoPagoResult[0] as any
            if (metodoPago["Metodo de pago"]) {
              metodoPagoNombre = metodoPago["Metodo de pago"]
            }
          }
        } catch (metodoPagoError) {
          console.error("Error getting metodo de pago:", metodoPagoError)

          // Intentar con un nombre alternativo para la tabla
          try {
            const metodoPagoQuery2 = `SELECT Tipo FROM Metodo_Pago WHERE ID = ?`
            const metodoPagoResult2 = await executeQuery(metodoPagoQuery2, [ticket.ID_Metodo_Pago])
            if (Array.isArray(metodoPagoResult2) && metodoPagoResult2.length > 0) {
              const metodoPago = metodoPagoResult2[0] as any
              if (metodoPago.Tipo) {
                metodoPagoNombre = metodoPago.Tipo
              }
            }
          } catch (metodoPagoError2) {
            console.error("Error getting metodo de pago (alternative):", metodoPagoError2)
          }
        }

        // Continuar con los detalles del ticket
        return await getTicketDetails(ticket, clienteNombre, metodoPagoNombre, id)
      }

      const ticket = ticketResult[0] as any
      console.log("Found ticket with joins:", ticket)

      // Determinar el nombre del cliente
      let clienteNombre = `Cliente ID: ${ticket.ID_Cliente || "N/A"}`
      if (ticket.Cliente_Usuario) {
        clienteNombre = ticket.Cliente_Usuario
      } else if (ticket.Cliente_Nombre) {
        clienteNombre =
          `${ticket.Cliente_Nombre} ${ticket.Cliente_Apellido_Paterno || ""} ${ticket.Cliente_Apellido_Materno || ""}`.trim()
      }

      // Determinar el nombre del método de pago
      let metodoPagoNombre = `Método ID: ${ticket.ID_Metodo_Pago || "N/A"}`
      if (ticket.Metodo_Pago_Nombre) {
        metodoPagoNombre = ticket.Metodo_Pago_Nombre
      }

      // Continuar con los detalles del ticket
      return await getTicketDetails(ticket, clienteNombre, metodoPagoNombre, id)
    } catch (queryError) {
      console.error("Error in ticket query:", queryError)
      return NextResponse.json({ message: "Error consultando el ticket", error: String(queryError) }, { status: 500 })
    }
  } catch (error) {
    console.error("General error:", error)
    return NextResponse.json({ message: "Error general", error: String(error) }, { status: 500 })
  }
}

async function getTicketDetails(ticket: any, clienteNombre: string, metodoPagoNombre: string, id: string) {
  // Paso 3: Obtener detalles del ticket con JOIN a productos
  let detalles = []
  try {
    // Intento con JOIN a Producto
    const detallesQuery = `
      SELECT 
        dv.*,
        p.\`Nombre del producto\` as Nombre_Producto,
        p.\`Precio unitario\` as Precio_Producto
      FROM Detalle_Venta dv
      JOIN Producto p ON dv.Codigo_Producto = p.Codigo
      WHERE dv.ID_Ticket_Venta = ?
    `
    const detallesResult = await executeQuery(detallesQuery, [id])
    console.log("Detalles query result:", detallesResult)

    if (Array.isArray(detallesResult) && detallesResult.length > 0) {
      detalles = detallesResult
    } else {
      // Intento sin JOIN
      const simpleDetallesQuery = `SELECT * FROM Detalle_Venta WHERE ID_Ticket_Venta = ?`
      const simpleDetallesResult = await executeQuery(simpleDetallesQuery, [id])
      if (Array.isArray(simpleDetallesResult) && simpleDetallesResult.length > 0) {
        detalles = simpleDetallesResult
      }
    }
  } catch (detalleError) {
    console.error("Error getting detalles:", detalleError)
    // Continuar sin detalles si hay error
  }

  // Paso 4: Formatear la respuesta
  const response = {
    ID: Number(ticket.ID) || 0,
    Fecha: ticket.Fecha || new Date().toISOString(),
    Cliente: clienteNombre,
    Empleado: `Empleado DNI: ${ticket.DNI_Empleado || "N/A"}`,
    Metodo_Pago: metodoPagoNombre,
    Total: Number(ticket.Total) || 0,
    Detalles: Array.isArray(detalles)
      ? detalles.map((detalle: any) => {
          console.log("Processing detalle:", detalle)

          // Intentar obtener el precio unitario de diferentes fuentes
          let precioUnitario = 0
          if (detalle["Precio unitario"] !== undefined) {
            precioUnitario = Number(detalle["Precio unitario"])
          } else if (detalle.Precio_unitario !== undefined) {
            precioUnitario = Number(detalle.Precio_unitario)
          } else if (detalle.Precio_Producto !== undefined) {
            precioUnitario = Number(detalle.Precio_Producto)
          }

          // Asegurarse de que los valores numéricos sean números
          const cantidad = Number(detalle.Cantidad) || 0
          const subtotal = cantidad * precioUnitario

          console.log(
            `Detalle ${detalle.Codigo_Producto}: Cantidad=${cantidad}, PrecioUnitario=${precioUnitario}, Subtotal=${subtotal}`,
          )

          return {
            Codigo_Producto: detalle.Codigo_Producto || "N/A",
            Nombre_Producto: detalle.Nombre_Producto || `Producto ${detalle.Codigo_Producto || "N/A"}`,
            Cantidad: cantidad,
            Precio_Unitario: precioUnitario,
            Subtotal: subtotal,
          }
        })
      : [],
  }

  console.log("Final response:", response)
  return NextResponse.json(response)
}
