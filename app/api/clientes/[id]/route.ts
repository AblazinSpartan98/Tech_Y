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
    console.log("Fetching client details for ID:", id)

    const query = "SELECT * FROM Cliente WHERE ID = ?"
    const result = await executeQuery(query, [id])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching client details:", error)
    return NextResponse.json(
      {
        message: "Error al obtener los detalles del cliente",
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const data = await request.json()
    console.log("Updating client with ID:", id, data)

    // Check if client exists
    const checkQuery = "SELECT ID FROM Cliente WHERE ID = ?"
    const checkResult = await executeQuery(checkQuery, [id])

    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    // Update client
    const updateQuery = `
      UPDATE Cliente 
      SET 
        Nombre = ?,
        \`Apellido Paterno\` = ?,
        \`Apellido Materno\` = ?,
        Telefono = ?,
        Email = ?,
        Direccion = ?
      WHERE ID = ?
    `
    await executeQuery(updateQuery, [
      data.nombre,
      data.apellidoPaterno,
      data.apellidoMaterno,
      data.telefono,
      data.email,
      data.direccion,
      id,
    ])

    return NextResponse.json({ message: "Cliente actualizado correctamente" })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json(
      {
        message: "Error al actualizar el cliente",
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar sesión
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    console.log("Deleting client with ID:", id)

    // Check if client exists
    const checkQuery = "SELECT ID FROM Cliente WHERE ID = ?"
    const checkResult = await executeQuery(checkQuery, [id])

    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    // Check if client has purchases
    const comprasQuery = "SELECT ID FROM Ticket_Venta WHERE ID_Cliente = ? LIMIT 1"
    const comprasResult = await executeQuery(comprasQuery, [id])

    if (Array.isArray(comprasResult) && comprasResult.length > 0) {
      return NextResponse.json(
        {
          message: "No se puede eliminar el cliente porque tiene compras asociadas",
        },
        { status: 400 },
      )
    }

    // Delete client
    const deleteQuery = "DELETE FROM Cliente WHERE ID = ?"
    await executeQuery(deleteQuery, [id])

    return NextResponse.json({ message: "Cliente eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      {
        message: "Error al eliminar el cliente",
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
