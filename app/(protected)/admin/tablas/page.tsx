import { getAllTables } from "@/app/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database } from "lucide-react"

export default async function TablesPage() {
  const { tables, error } = await getAllTables()

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Ver Tablas</h1>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  const tableNames = Object.keys(tables || {})

  if (tableNames.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Ver Tablas</h1>
        <Card>
          <CardContent className="text-center py-6">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg font-medium">No hay tablas disponibles</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ver Tablas</h1>

      <Tabs defaultValue={tableNames[0]}>
        <TabsList className="mb-4 flex flex-wrap">
          {tableNames.map((tableName) => (
            <TabsTrigger key={tableName} value={tableName}>
              {tableName}
            </TabsTrigger>
          ))}
        </TabsList>

        {tableNames.map((tableName) => (
          <TabsContent key={tableName} value={tableName}>
            <Card>
              <CardHeader>
                <CardTitle>Tabla: {tableName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        {tables && tables[tableName] && tables[tableName].length > 0 ? (
                          Object.keys(tables[tableName][0]).map((key) => (
                            <th key={key} className="border p-2 text-left">
                              {key}
                            </th>
                          ))
                        ) : (
                          <th className="border p-2 text-left">No hay columnas</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tables && tables[tableName] && tables[tableName].length > 0 ? (
                        tables[tableName].map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="border p-2">
                                {value !== null && value !== undefined ? String(value) : "NULL"}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border p-2">No hay datos</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
