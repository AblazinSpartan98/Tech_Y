import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("API: Obteniendo productos...")

    // Consulta SQL simplificada para evitar problemas con nombres de columnas
    const query = "SELECT * FROM Producto"

    console.log("Ejecutando consulta:", query)

    const productos = await executeQuery(query)

    // Verificar la respuesta
    console.log("Respuesta de la base de datos:", productos)
    console.log(`API: Se encontraron ${Array.isArray(productos) ? productos.length : 0} productos`)

    // Verificar si productos es un array
    if (!Array.isArray(productos)) {
      console.error("API: La consulta no devolvió un array:", productos)
      return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
    }

    // Verificar la estructura de los datos
    if (productos.length > 0) {
      console.log("Estructura del primer producto:", Object.keys(productos[0]))
    }

    return NextResponse.json(productos)
  } catch (error) {
    console.error("API: Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("POST /api/productos - Received data:", data)

    // Validar datos requeridos
    if (!data.codigo || !data.nombre || data.precio === undefined || data.stock === undefined || !data.tipo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el código ya existe
    const existingProduct = await executeQuery("SELECT Codigo FROM Producto WHERE Codigo = ?", [data.codigo])
    if (Array.isArray(existingProduct) && existingProduct.length > 0) {
      return NextResponse.json({ error: "Ya existe un producto con este código" }, { status: 400 })
    }

    // Insertar nuevo producto
    await executeQuery(
      "INSERT INTO Producto (Codigo, `Nombre del producto`, `Precio unitario`, Cantidad, Tipo) VALUES (?, ?, ?, ?, ?)",
      [data.codigo, data.nombre, data.precio, data.stock, data.tipo],
    )

    return NextResponse.json({ success: true, message: "Producto creado correctamente" })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
