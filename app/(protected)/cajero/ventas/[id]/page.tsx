import { getTicketDetails } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const { details, ticket, error } = await getTicketDetails(params.id)

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/cajero/ventas" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detalle de Ticket</h1>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/cajero/ventas" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Detalle de Ticket</h1>
        </div>
        <div>Ticket no encontrado</div>
      </div>
    )
  }

  const date = new Date(ticket.Fecha)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/cajero/ventas" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Ticket #{ticket.ID}</h1>
        </div>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Fecha</div>
                <div>
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cliente</div>
                <div>
                  {ticket.ClienteNombre ? `${ticket.ClienteNombre} ${ticket.ClienteApellido}` : "Cliente no registrado"}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
