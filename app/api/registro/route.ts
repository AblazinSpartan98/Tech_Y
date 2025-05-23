import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const nombre = formData.get("nombre") as string
    const apellidoPaterno = formData.get("apellidoPaterno") as string
    const apellidoMaterno = formData.get("apellidoMaterno") as string
    const direccion = (formData.get("direccion") as string) || null
    const telefono = formData.get("telefono") as string
    const usuario = formData.get("usuario") as string
    const contra = formData.get("contra") as string

    // Validar datos
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !telefono || !usuario || !contra) {
      return NextResponse.json({ error: "Todos los campos obligatorios deben ser completados" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUsers = await executeQuery("SELECT ID FROM Cliente WHERE Usuario = ?", [usuario])

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: "El nombre de usuario ya está en uso" }, { status: 400 })
    }

    // Insertar nuevo cliente
    const result = await executeQuery(
      "INSERT INTO Cliente (Nombre, `Apellido Paterno`, `Apellido Materno`, Direccion, Teléfono, Usuario, Contra) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellidoPaterno, apellidoMaterno, direccion, telefono, usuario, contra],
    )

    return NextResponse.json({ success: true, clientId: result.insertId })
  } catch (error) {
    console.error("Error al registrar cliente:", error)
    return NextResponse.json({ error: "Error al registrar cliente" }, { status: 500 })
  }
}
