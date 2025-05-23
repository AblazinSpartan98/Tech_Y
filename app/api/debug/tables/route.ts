import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  let connection
  try {
    connection = await connectToDatabase()

    // Obtener información sobre las tablas
    const [tables] = await connection.query(
      `
      SELECT 
        TABLE_NAME 
      FROM 
        information_schema.TABLES 
      WHERE 
        TABLE_SCHEMA = ?
    `,
      [process.env.MYSQL_DATABASE],
    )

    const tableInfo = []

    // Para cada tabla, obtener su estructura
    for (const table of tables as any[]) {
      const tableName = table.TABLE_NAME

      const [columns] = await connection.query(
        `
        SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          IS_NULLABLE, 
          COLUMN_KEY
        FROM 
          information_schema.COLUMNS 
        WHERE 
          TABLE_SCHEMA = ? AND 
          TABLE_NAME = ?
        ORDER BY 
          ORDINAL_POSITION
      `,
        [process.env.MYSQL_DATABASE, tableName],
      )

      // Obtener una muestra de datos
      const [sampleData] = await connection.query(`
        SELECT * FROM ${tableName} LIMIT 1
      `)

      tableInfo.push({
        tableName,
        columns,
        sampleData: sampleData.length > 0 ? sampleData[0] : null,
      })
    }

    return NextResponse.json({
      database: process.env.MYSQL_DATABASE,
      tables: tableInfo,
    })
  } catch (error) {
    console.error("Error al obtener información de las tablas:", error)
    return NextResponse.json(
      { error: "Error al obtener información de las tablas", details: String(error) },
      { status: 500 },
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
