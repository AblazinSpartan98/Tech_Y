"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

// Mock product data
const product = {
  id: 1,
  name: "NVIDIA GeForce RTX 4080 Super 16GB GDDR6X Graphics Card",
  description:
    "The GeForce RTX 4080 Super delivers the ultra performance and features that enthusiast gamers and creators demand. Bring your games and creative projects to life with ray tracing and AI-powered graphics. It's powered by the NVIDIA Ada Lovelace architecture and comes with 16GB of G6X memory to deliver the ultimate experience for gamers and creators.",
  price: 999.99,
  rating: 4.9,
  reviewCount: 128,
  stock: 12,
  brand: "NVIDIA",
  category: "Graphics Cards",
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  specs: {
    "GPU Memory": "16GB GDDR6X",
    "Memory Interface": "256-bit",
    "CUDA Cores": "10240",
    "Boost Clock": "2.5 GHz",
    "Power Consumption": "320W",
    "Recommended PSU": "750W",
    Dimensions: "12.3 x 5.4 x 2.4 inches",
  },
  features: [
    "NVIDIA DLSS 3 - AI-powered performance multiplier",
    "Ray Tracing - Lifelike visuals with incredibly detailed reflections, shadows, and lighting",
    "NVIDIA Reflex - Get the lowest latency and best responsiveness in competitive games",
    "NVIDIA Broadcast - AI-enhanced voice and video for content creators",
    "G-SYNC Compatible - For smooth, tear-free gaming",
  ],
}

// Mock related products
const relatedProducts = [
  {
    id: 5,
    name: "ASUS ROG Strix Z790-E Gaming",
    category: "Motherboards",
    price: 399.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "AMD Ryzen 9 7950X",
    category: "Processors",
    price: 549.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "Corsair RM850x Power Supply",
    category: "Power Supplies",
    price: 129.99,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const addToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="flex items-center text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <img
              src={product.images[activeImage] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-auto object-cover"
              width={600}
              height={600}
            />
          </div>
          <div className="flex space-x-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`border rounded-md overflow-hidden ${activeImage === index ? "ring-2 ring-primary" : ""}`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - view ${index + 1}`}
                  className="w-20 h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{product.category}</div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              <span className="ml-2 text-sm text-gray-500">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="text-3xl font-bold">${product.price}</div>

          <div className="flex items-center text-sm">
            <Badge variant="outline" className="text-green-600 border-green-600 mr-2">
              <Check className="mr-1 h-3 w-3" /> In Stock
            </Badge>
            <span className="text-gray-500">{product.stock} available</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1" onClick={addToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <Truck className="h-4 w-4" />
            <span>Free shipping on orders over $100</span>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2">Product Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="specs" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="p-4 border rounded-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="font-medium">{key}</span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="features" className="p-4 border rounded-md mt-2">
          <ul className="space-y-2">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
            <p className="text-gray-500 mb-4">
              This product has {product.reviewCount} reviews with an average rating of {product.rating} stars.
            </p>
            <Button>Write a Review</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <Card key={relatedProduct.id} className="overflow-hidden">
              <Link href={`/products/${relatedProduct.id}`}>
                <img
                  src={relatedProduct.image || "/placeholder.svg"}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                  width={200}
                  height={200}
                />
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{relatedProduct.category}</div>
                  <h3 className="font-semibold line-clamp-2">{relatedProduct.name}</h3>
                  <div className="font-bold mt-2">${relatedProduct.price}</div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
