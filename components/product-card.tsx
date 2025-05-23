import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AddToCartButton from "./add-to-cart-button"

interface ProductCardProps {
  product: {
    Codigo: string
    "Nombre del producto": string
    Cantidad?: number
    "Precio unitario": number
    Tipo?: string
  }
  showAddToCart?: boolean
}

export default function ProductCard({ product, showAddToCart = false }: ProductCardProps) {
  // Ensure we have valid product data
  if (!product || !product.Codigo || !product["Nombre del producto"]) {
    console.error("Invalid product data:", product)
    return null
  }

  const stockAvailable = product.Cantidad && product.Cantidad > 0
  const imageUrl = `/placeholder.svg?height=200&width=200`

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/productos/${product.Codigo}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product["Nombre del producto"]}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <Link href={`/productos/${product.Codigo}`} className="hover:underline">
              <h3 className="font-medium line-clamp-2">{product["Nombre del producto"]}</h3>
            </Link>
            {product.Tipo && (
              <Badge variant="outline" className="ml-2">
                {product.Tipo}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg">
              $
              {typeof product["Precio unitario"] === "number"
                ? product["Precio unitario"].toFixed(2)
                : Number.parseFloat(product["Precio unitario"]).toFixed(2)}
            </p>
            {typeof product.Cantidad !== "undefined" && (
              <span className={`text-sm ${stockAvailable ? "text-green-600" : "text-red-600"}`}>
                {stockAvailable ? `Stock: ${product.Cantidad}` : "Agotado"}
              </span>
            )}
          </div>
          {showAddToCart && stockAvailable && (
            <div className="pt-2">
              <AddToCartButton product={product} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
