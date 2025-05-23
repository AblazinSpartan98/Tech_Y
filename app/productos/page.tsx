"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Filter, AlertCircle } from "lucide-react"
import ProductCard from "@/components/product-card"
import CartSidebar from "@/components/cart-sidebar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Product {
  Codigo: string
  "Nombre del producto": string
  Cantidad: number
  "Precio unitario": number
  Tipo: string
}

interface ProductType {
  id_tipo: number
  nombre: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching products data...")
        setLoading(true)
        setError(null)
        setErrorDetails(null)

        // Fetch products
        const response = await fetch("/api/productos")
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        if (data.error) {
          setErrorDetails(data.detail || "No hay detalles disponibles")
          throw new Error(`Error del servidor: ${data.error}`)
        }

        // Handle different response formats
        let productsArray: Product[] = []
        let typesArray: ProductType[] = []

        if (data.productos && Array.isArray(data.productos)) {
          console.log(`Found ${data.productos.length} products`)
          productsArray = data.productos
        } else if (Array.isArray(data)) {
          console.log(`Found ${data.length} products (direct array)`)
          productsArray = data
        } else {
          console.error("Unexpected data format:", data)
          throw new Error("Formato de datos inesperado")
        }

        // Get product types
        if (data.tipos && Array.isArray(data.tipos)) {
          console.log(`Found ${data.tipos.length} product types`)
          typesArray = data.tipos
        }

        setProducts(productsArray)
        setFilteredProducts(productsArray)
        setProductTypes(typesArray)
      } catch (err) {
        console.error("Error loading data:", err)
        setError(`Error al cargar datos: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter products when criteria change
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setFilteredProducts([])
      return
    }

    let result = [...products]

    // Filter by search term
    if (searchTerm) {
      result = result.filter((product) =>
        product["Nombre del producto"]?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      result = result.filter((product) => product.Tipo && selectedTypes.includes(product.Tipo))
    }

    setFilteredProducts(result)
  }, [searchTerm, selectedTypes, products])

  // Handle type checkbox change
  const handleTypeChange = (tipo: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(tipo)) {
        return prev.filter((t) => t !== tipo)
      } else {
        return [...prev, tipo]
      }
    })
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Search is already handled in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <span className="ml-2 text-xl font-bold">Tech-Y</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/registro">
              <Button>Crear Cuenta</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {errorDetails && (
                <details className="mt-2 text-sm">
                  <summary>Detalles técnicos</summary>
                  <pre className="mt-2 whitespace-pre-wrap bg-slate-950 p-4 rounded-md overflow-auto text-white">
                    {errorDetails}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar productos..."
                className="max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit">Buscar</Button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="space-y-2">
                    {loading ? (
                      <p>Cargando categorías...</p>
                    ) : error ? (
                      <p className="text-red-500">Error al cargar categorías</p>
                    ) : productTypes.length > 0 ? (
                      productTypes.map((type, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${index}`}
                            checked={selectedTypes.includes(type.nombre)}
                            onCheckedChange={() => handleTypeChange(type.nombre)}
                          />
                          <label htmlFor={`type-${index}`} className="text-sm">
                            {type.nombre}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p>No hay categorías disponibles</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product list */}
          <div className="lg:col-span-6">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-lg">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-lg">No se pudieron cargar los productos</p>
                <p className="text-sm text-gray-500 mt-2">Intenta recargar la página</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.Codigo} product={product} showAddToCart={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-4 text-lg font-medium">No se encontraron productos</h2>
                <p className="mt-2 text-gray-500">Intenta con otros criterios de búsqueda</p>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-3">
            <CartSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
