import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const tipos = await executeQuery("SELECT ID as id_tipo, Nombre as nombre FROM Tipo_Producto ORDER BY Nombre")
    return NextResponse.json(tipos)
  } catch (error) {
    console.error("Error al obtener tipos de producto:", error)
    return NextResponse.json({ error: "Error al obtener tipos de producto" }, { status: 500 })
  }
}
