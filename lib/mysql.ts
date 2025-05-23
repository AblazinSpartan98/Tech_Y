import mysql from "mysql2/promise"

// Configuración de la conexión a MySQL
export async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "Tech_Y",
  })
  return connection
}

// Función para ejecutar consultas SQL
export async function executeQuery(query: string, params: any[] = []) {
  const connection = await connectToDatabase()
  try {
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Error executing query:", error)
    throw error
  } finally {
    await connection.end()
  }
}

// Función para obtener un solo registro
export async function getOne(query: string, params: any[] = []) {
  const results = (await executeQuery(query, params)) as any[]
  return results && results.length > 0 ? results[0] : null
}
