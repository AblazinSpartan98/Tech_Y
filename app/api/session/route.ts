import { NextResponse } from "next/server"
import { getSession } from "@/app/actions/auth"

export async function GET() {
  try {
    const session = await getSession()

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ error: "Error al obtener la sesión" }, { status: 500 })
  }
}
