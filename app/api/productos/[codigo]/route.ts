import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const codigo = params.codigo

    const query = "SELECT * FROM Producto WHERE Codigo = ?"
    const result = await executeQuery(query, [codigo])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const codigo = params.codigo
    const data = await request.json()

    // Validar datos requeridos
    if (!data.nombre || data.precio === undefined || data.stock === undefined || !data.tipo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el producto existe
    const existingProduct = await executeQuery("SELECT Codigo FROM Producto WHERE Codigo = ?", [codigo])
    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Actualizar producto
    await executeQuery(
      "UPDATE Producto SET `Nombre del producto` = ?, `Precio unitario` = ?, Cantidad = ?, Tipo = ? WHERE Codigo = ?",
      [data.nombre, data.precio, data.stock, data.tipo, codigo],
    )

    return NextResponse.json({ success: true, message: "Producto actualizado correctamente" })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { codigo: string } }) {
  try {
    const codigo = params.codigo

    // Verificar si el producto existe
    const existingProduct = await executeQuery("SELECT Codigo FROM Producto WHERE Codigo = ?", [codigo])
    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar producto
    await executeQuery("DELETE FROM Producto WHERE Codigo = ?", [codigo])

    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
