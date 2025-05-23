import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("GET /api/tickets - Starting request")

    // Primero, vamos a verificar la conexión a la base de datos
    try {
      const testQuery = "SELECT 1 as test"
      await executeQuery(testQuery, [])
      console.log("Database connection test successful")
    } catch (connError) {
      console.error("Database connection test failed:", connError)
      return NextResponse.json(
        {
          error: "Error de conexión a la base de datos",
          detail: String(connError),
        },
        { status: 500 },
      )
    }

    // Vamos a verificar qué tablas existen en la base de datos
    try {
      const tablesQuery = "SHOW TABLES"
      const tables = await executeQuery(tablesQuery, [])
      console.log("Tables in database:", tables)
    } catch (tablesError) {
      console.error("Error listing tables:", tablesError)
    }

    // Vamos a verificar la estructura de la tabla Ticket_Venta
    try {
      const structureQuery = "DESCRIBE Ticket_Venta"
      const structure = await executeQuery(structureQuery, [])
      console.log("Ticket_Venta structure:", structure)
    } catch (structureError) {
      console.error("Error getting Ticket_Venta structure:", structureError)
      // Si no podemos obtener la estructura, intentemos con otro nombre de tabla
      try {
        const alternativeQuery = "SHOW TABLES LIKE '%ticket%'"
        const alternativeTables = await executeQuery(alternativeQuery, [])
        console.log("Tables matching 'ticket':", alternativeTables)
      } catch (altError) {
        console.error("Error finding alternative tables:", altError)
      }
    }

    // Consulta simplificada para obtener tickets
    // Usamos una consulta básica sin joins para minimizar errores
    const query = "SELECT * FROM Ticket_Venta LIMIT 100"
    console.log("Executing simplified ticket query:", query)

    const tickets = await executeQuery(query, [])
    console.log("Tickets found:", tickets ? (tickets as any[]).length : 0)
    if (tickets && (tickets as any[]).length > 0) {
      console.log("First ticket sample:", (tickets as any[])[0])
    }

    return NextResponse.json(tickets || [])
  } catch (error) {
    console.error("Error in GET /api/tickets:", error)
    return NextResponse.json(
      {
        error: "Error al obtener tickets",
        detail: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
