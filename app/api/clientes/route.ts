import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/clientes - Starting request")

    // Simple query to test database connection
    const testQuery = "SELECT 1 as test"
    await executeQuery(testQuery, [])
    console.log("Database connection test successful")

    // Basic query to get all clients
    const query = "SELECT * FROM Cliente"
    console.log("Executing client query:", query)

    const clientes = await executeQuery(query, [])
    console.log("Clients found:", clientes ? (clientes as any[]).length : 0)

    return NextResponse.json({
      clientes: clientes || [],
    })
  } catch (error) {
    console.error("Error in GET /api/clientes:", error)
    return NextResponse.json(
      {
        error: "Error al obtener clientes",
        detail: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (
      !data.nombre ||
      !data.apellidoPaterno ||
      !data.apellidoMaterno ||
      !data.telefono ||
      !data.usuario ||
      !data.contra
    ) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Check if username already exists
    const usuarioExistente = await executeQuery("SELECT ID FROM Cliente WHERE Usuario = ?", [data.usuario])
    if (Array.isArray(usuarioExistente) && usuarioExistente.length > 0) {
      return NextResponse.json({ error: "El nombre de usuario ya está en uso" }, { status: 400 })
    }

    // Insert new client
    const result = await executeQuery(
      "INSERT INTO Cliente (Nombre, `Apellido Paterno`, `Apellido Materno`, Direccion, Teléfono, Usuario, Contra) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        data.nombre,
        data.apellidoPaterno,
        data.apellidoMaterno,
        data.direccion || null,
        data.telefono,
        data.usuario,
        data.contra,
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Cliente registrado correctamente",
      clienteId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error in POST /api/clientes:", error)
    return NextResponse.json(
      {
        error: "Error al registrar cliente",
        detail: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
