import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const metodosPago = await executeQuery("SELECT ID, Tipo FROM Metodo_Pago ORDER BY Tipo ASC")
    return NextResponse.json(metodosPago)
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error)
    return NextResponse.json({ error: "Error al obtener métodos de pago" }, { status: 500 })
  }
}
