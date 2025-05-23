"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: "NVIDIA RTX 4080 Super",
    category: "Graphics Cards",
    price: 999.99,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    sale: false,
    stock: 12,
  },
  {
    id: 2,
    name: "AMD Ryzen 9 7950X",
    category: "Processors",
    price: 549.99,
    originalPrice: 649.99,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=300",
    sale: true,
    stock: 8,
  },
  {
    id: 3,
    name: "Samsung 990 PRO 2TB SSD",
    category: "Storage",
    price: 179.99,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=300",
    sale: false,
    stock: 20,
  },
  {
    id: 4,
    name: "Corsair Vengeance RGB 32GB DDR5",
    category: "Memory",
    price: 149.99,
    originalPrice: 189.99,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=300",
    sale: true,
    stock: 15,
  },
]

export default function FeaturedProducts() {
  const [cart, setCart] = useState<number[]>([])

  const addToCart = (productId: number) => {
    setCart([...cart, productId])
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {featuredProducts.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative">
            {product.sale && <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">Sale</Badge>}
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover"
              width={300}
              height={300}
            />
          </div>
          <CardHeader className="p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <div className="flex items-center mt-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              <span className="ml-1 text-sm text-gray-500">{product.rating}</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center">
              <div className="font-bold text-xl">${product.price}</div>
              {product.originalPrice && (
                <div className="ml-2 text-sm text-gray-500 line-through">${product.originalPrice}</div>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </div>
          </CardContent>
          <CardFooter className="p-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => addToCart(product.id)}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Link href={`/products/${product.id}`} className="flex-1">
              <Button size="sm" variant="secondary" className="w-full">
                Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
