"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { EmployeeActionsCell } from "./employee-actions"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/empleados")
        if (!response.ok) {
          throw new Error("Error al cargar empleados")
        }
        const data = await response.json()
        setEmployees(data)
      } catch (err) {
        setError("Error al cargar empleados")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const columns = [
    {
      id: "DNI",
      accessorKey: "DNI",
      header: "DNI",
    },
    {
      id: "Nombre",
      accessorKey: "Nombre",
      header: "Nombre",
    },
    {
      id: "Apellido Paterno",
      accessorKey: "Apellido Paterno",
      header: "Apellido Paterno",
    },
    {
      id: "Apellido Materno",
      accessorKey: "Apellido Materno",
      header: "Apellido Materno",
    },
    {
      id: "Puesto",
      accessorKey: "Puesto",
      header: "Puesto",
    },
    {
      id: "Salario",
      accessorKey: "Salario",
      header: "Salario",
    },
    {
      id: "Fecha de contratacion",
      accessorKey: "Fecha de contratacion",
      header: "Fecha de Contratación",
    },
    {
      id: "actions",
      header: "Acciones",
    },
  ]

  // Transformar los datos para el renderizado
  const formattedEmployees = employees
    ? employees.map((employee: any) => ({
        ...employee,
        Salario: new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(employee.Salario),
        "Fecha de contratacion": new Date(employee["Fecha de contratacion"]).toLocaleDateString(),
      }))
    : []

  const renderCell = (row: any, column: any) => {
    if (column.id === "actions") {
      return <EmployeeActionsCell employee={row.original} />
    }
    return row.getValue(column.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h1>
        <Link href="/admin/empleados/nuevo">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Cargando empleados...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : formattedEmployees && formattedEmployees.length > 0 ? (
            <DataTable columns={columns} data={formattedEmployees} renderCell={renderCell} />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay empleados registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
