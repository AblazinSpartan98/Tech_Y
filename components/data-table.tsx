"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface DataTableProps {
  columns: {
    id: string
    accessorKey?: string
    header: string
    cell?: (props: any) => React.ReactNode
  }[]
  data: any[]
  searchColumn?: string
  searchPlaceholder?: string
  renderCell?: (row: any, column: any) => React.ReactNode
}

export function DataTable({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Buscar...",
  renderCell,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  console.log("DataTable received data:", data)
  console.log("DataTable columns:", columns)

  // Filter data based on search term
  const filteredData =
    searchTerm && searchColumn
      ? data.filter((item) => {
          const value = item[searchColumn]
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      : data

  console.log("Filtered data:", filteredData)

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  console.log("Paginated data:", paginatedData)

  return (
    <div className="space-y-4">
      {searchColumn && (
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => {
                    // Obtener el valor para esta celda
                    const accessorKey = column.accessorKey || column.id
                    const value = row[accessorKey]

                    return (
                      <TableCell key={column.id}>
                        {renderCell ? (
                          // Si hay una función renderCell personalizada, úsala
                          renderCell({ original: row, getValue: () => value }, column)
                        ) : column.cell ? (
                          // Si la columna tiene una función cell personalizada, úsala
                          column.cell({ getValue: () => value })
                        ) : (
                          // De lo contrario, renderiza el valor directamente con un estilo visible
                          <span className="font-medium text-foreground">
                            {value !== null && value !== undefined ? String(value) : "N/A"}
                          </span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
