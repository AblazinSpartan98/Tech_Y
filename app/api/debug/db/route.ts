import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    console.log("Probando conexión a la base de datos...")

    // Probar conexión
    const testQuery = "SELECT 1 as test"
    const testResult = await executeQuery(testQuery)
    console.log("Resultado de prueba de conexión:", testResult)

    // Obtener información sobre la tabla Producto
    const tableInfoQuery = "DESCRIBE Producto"
    const tableInfo = await executeQuery(tableInfoQuery)
    console.log("Estructura de la tabla Producto:", tableInfo)

    // Obtener una muestra de productos
    const sampleQuery = "SELECT * FROM Producto LIMIT 5"
    const sampleProducts = await executeQuery(sampleQuery)
    console.log("Muestra de productos:", sampleProducts)

    return NextResponse.json({
      success: true,
      connectionTest: testResult,
      tableStructure: tableInfo,
      sampleProducts: sampleProducts,
    })
  } catch (error) {
    console.error("Error en la prueba de base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
