import { executeQuery } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const nombre = formData.get("nombre") as string
    const direccion = formData.get("direccion") as string
    const telefono = formData.get("telefono") as string
    const correo = formData.get("correo") as string

    // Validar datos
    if (!nombre || !telefono) {
      return NextResponse.json({ error: "El nombre de la empresa y el teléfono son obligatorios" }, { status: 400 })
    }

    // Insertar proveedor en la base de datos
    await executeQuery(
      "INSERT INTO Proveedor (`Nombre de la empresa`, Direccion, Telefono, `Correo electronico`) VALUES (?, ?, ?, ?)",
      [nombre, direccion || null, telefono, correo || null],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al registrar proveedor:", error)
    return NextResponse.json({ error: "Error al registrar proveedor. Inténtelo de nuevo más tarde." }, { status: 500 })
  }
}
