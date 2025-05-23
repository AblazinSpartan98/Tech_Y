"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/data-table"

export default function TestProductosPage() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    // Datos de prueba para verificar que la tabla funciona
    const testData = [
      {
        Codigo: "TEST001",
        "Nombre del producto": "Producto de Prueba 1",
        Tipo: "Electrónico",
        "Precio unitario": 100.5,
        Cantidad: 10,
      },
      {
        Codigo: "TEST002",
        "Nombre del producto": "Producto de Prueba 2",
        Tipo: "Ropa",
        "Precio unitario": 25.99,
        Cantidad: 5,
      },
    ]

    setProductos(testData)
  }, [])

  const columns = [
    {
      id: "Codigo",
      accessorKey: "Codigo",
      header: "Código",
    },
    {
      id: "Nombre del producto",
      accessorKey: "Nombre del producto",
      header: "Nombre",
    },
    {
      id: "Tipo",
      accessorKey: "Tipo",
      header: "Tipo",
    },
    {
      id: "Precio unitario",
      accessorKey: "Precio unitario",
      header: "Precio",
    },
    {
      id: "Cantidad",
      accessorKey: "Cantidad",
      header: "Stock",
    },
  ]

  const renderCell = (row: any, column: any) => {
    const value = row.getValue(column.id)

    if (column.id === "Precio unitario") {
      return value ? `$${Number.parseFloat(value).toFixed(2)}` : "N/A"
    }

    return value || "N/A"
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Prueba de Productos</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <DataTable
          columns={columns}
          data={productos}
          renderCell={renderCell}
          searchColumn="Nombre del producto"
          searchPlaceholder="Buscar productos..."
        />
      </div>
    </div>
  )
}
