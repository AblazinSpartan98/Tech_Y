import { getSession } from "@/app/actions/auth"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import { redirect } from "next/navigation"

async function getPurchaseDetails(ticketId: string, clientId: string) {
  try {
    // Verificar que el ticket pertenece al cliente
    const ticket = await executeQuery(
      `
      SELECT tv.*, mp.\`Metodo de pago\` as MetodoPago, 
             CONCAT(e.Nombre, ' ', e.\`Apellido Paterno\`) as EmpleadoNombre
      FROM Ticket_Venta tv 
      LEFT JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID
      LEFT JOIN Empleado e ON tv.DNI_Empleado = e.DNI
      WHERE tv.ID = ? AND tv.ID_Cliente = ?
    `,
      [ticketId, clientId],
    )

    if (!ticket || ticket.length === 0) {
      return { details: [], ticket: null, error: "Ticket no encontrado o no tienes permiso para verlo" }
    }

    // Obtener detalles del ticket
    const details = await executeQuery(
      `
      SELECT dv.*, p.\`Nombre del producto\`
      FROM Detalle_Venta dv
      JOIN Producto p ON dv.Codigo_Producto = p.Codigo
      WHERE dv.ID_Ticket_Venta = ?
    `,
      [ticketId],
    )

    return { details, ticket: ticket[0], error: null }
  } catch (error) {
    console.error("Error al obtener detalles de la compra:", error)
    return { details: [], ticket: null, error: "Error al cargar los detalles de la compra" }
  }
}

export default async function ClientePurchaseDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session || session.role !== "cliente") {
    redirect("/unauthorized")
  }

  const { details, ticket, error } = await getPurchaseDetails(params.id, session.id)

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/cliente/compras" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detalles de la Compra</h1>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/cliente/compras" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detalles de la Compra</h1>
        </div>
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-lg font-medium">Ticket no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const date = new Date(ticket.Fecha)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/cliente/compras" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Compra #{ticket.ID}</h1>
        </div>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Fecha</div>
                <div>
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Método de Pago</div>
                <div>{ticket.MetodoPago}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Atendido por</div>
                <div>{ticket.EmpleadoNombre}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="font-bold">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(ticket.Total)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Producto</th>
                      <th className="py-2 text-right">Precio</th>
                      <th className="py-2 text-right">Cantidad</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details &&
                      details.map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item["Nombre del producto"]}</td>
                          <td className="py-2 text-right">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            }).format(item.Precio_unitario)}
                          </td>
                          <td className="py-2 text-right">{item.Cantidad}</td>
                          <td className="py-2 text-right">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            }).format(item.Subtotal)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-2" colSpan={3}>
                        Total
                      </td>
                      <td className="py-2 text-right">
                        {new Intl.NumberFormat("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        }).format(ticket.Total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
