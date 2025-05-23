import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acceso No Autorizado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página. Por favor, inicia sesión con una cuenta que tenga los permisos
          necesarios.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/login">
            <Button className="w-full">Iniciar Sesión</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
