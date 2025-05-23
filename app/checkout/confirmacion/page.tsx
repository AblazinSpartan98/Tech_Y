import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/app/actions/auth"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ShoppingBag } from "lucide-react"

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { ticketId?: string }
}) {
  // Verificar si el usuario está autenticado
  const session = await getSession()

  // Si no hay sesión o no hay ticketId, redirigir
  if (!session || !searchParams.ticketId) {
    redirect("/")
  }

  const ticketId = searchParams.ticketId

  // Obtener detalles del ticket
  const ticketResult = await executeQuery(
    `SELECT tv.*, mp.\`Metodo de pago\` as MetodoPago 
     FROM Ticket_Venta tv 
     JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID 
     WHERE tv.ID = ?`,
    [ticketId],
  )

  if (!Array.isArray(ticketResult) || ticketResult.length === 0) {
    redirect("/")
  }

  const ticket = ticketResult[0]

  // Obtener detalles de los productos
  const detallesResult = await executeQuery(
    `SELECT dv.*, p.\`Nombre del producto\` 
     FROM Detalle_Venta dv 
     JOIN Producto p ON dv.Codigo_Producto = p.Codigo 
     WHERE dv.ID_Ticket_Venta = ?`,
    [ticketId],
  )

  const detalles = Array.isArray(detallesResult) ? detallesResult : []

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Compra Realizada con Éxito!</CardTitle>
          <p className="text-gray-500 mt-2">Tu pedido ha sido procesado correctamente. Ticket #{ticketId}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Detalles del Pedido</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Fecha:</div>
              <div>{new Date(ticket.Fecha).toLocaleString()}</div>
              <div>Método de Pago:</div>
              <div>{ticket.MetodoPago}</div>
              <div>Total:</div>
              <div className="font-bold">${Number(ticket.Total).toLocaleString()}</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Productos</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detalles.map((detalle: any) => (
                    <tr key={detalle.ID}>
                      <td className="px-4 py-2 whitespace-nowrap">{detalle["Nombre del producto"]}</td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">{detalle.Cantidad}</td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        ${Number(detalle.Precio_unitario).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        ${Number(detalle.Subtotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link href="/cliente/compras">
            <Button variant="outline">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Mis Compras
            </Button>
          </Link>
          <Link href="/productos">
            <Button>Seguir Comprando</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
