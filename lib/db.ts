import mysql from "mysql2/promise"

// Database connection configuration
export async function connectToDatabase() {
  try {
    console.log("Connecting to database...")
    console.log("Host:", process.env.MYSQL_HOST)
    console.log("Database:", process.env.MYSQL_DATABASE)
    console.log("User:", process.env.MYSQL_USER)

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      // Enable this to see all queries
      debug: false,
      // Convert MySQL date/time types to JS Date objects
      dateStrings: true,
    })

    console.log("Database connection successful!")
    return connection
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error(`Failed to connect to the database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Execute a query with parameters
export async function executeQuery(query: string, params: any[] = []) {
  let connection
  try {
    connection = await connectToDatabase()
    console.log("Executing query:", query)
    console.log("With parameters:", params)

    const [results] = await connection.execute(query, params)
    console.log("Query executed successfully, rows returned:", Array.isArray(results) ? results.length : "unknown")
    return results
  } catch (error) {
    console.error("Error executing query:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log("Database connection closed")
    }
  }
}

// Get a single record
export async function getOne(query: string, params: any[] = []) {
  try {
    const results = await executeQuery(query, params)
    return Array.isArray(results) && results.length > 0 ? results[0] : null
  } catch (error) {
    console.error("Error in getOne:", error)
    throw error
  }
}
