"use client"

import { useState } from "react"
import Link from "next/link"
import { Filter, ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"

// Mock data for products
const products = [
  {
    id: 1,
    name: "NVIDIA RTX 4080 Super",
    category: "Graphics Cards",
    price: 999.99,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    sale: false,
    stock: 12,
    brand: "NVIDIA",
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
    brand: "AMD",
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
    brand: "Samsung",
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
    brand: "Corsair",
  },
  {
    id: 5,
    name: "ASUS ROG Strix Z790-E Gaming",
    category: "Motherboards",
    price: 399.99,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=300",
    sale: false,
    stock: 7,
    brand: "ASUS",
  },
  {
    id: 6,
    name: "Corsair RM850x Power Supply",
    category: "Power Supplies",
    price: 129.99,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=300",
    sale: false,
    stock: 18,
    brand: "Corsair",
  },
  {
    id: 7,
    name: "NZXT H510 Flow Case",
    category: "Cases",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.4,
    image: "/placeholder.svg?height=300&width=300",
    sale: true,
    stock: 10,
    brand: "NZXT",
  },
  {
    id: 8,
    name: "Noctua NH-D15 CPU Cooler",
    category: "Cooling",
    price: 99.99,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    sale: false,
    stock: 5,
    brand: "Noctua",
  },
]

// Categories for filtering
const categories = [
  "All Categories",
  "Graphics Cards",
  "Processors",
  "Motherboards",
  "Memory",
  "Storage",
  "Power Supplies",
  "Cases",
  "Cooling",
]

// Brands for filtering
const brands = ["NVIDIA", "AMD", "Intel", "ASUS", "MSI", "Gigabyte", "Corsair", "Samsung", "NZXT", "Noctua"]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortOption, setSortOption] = useState("featured")
  const [cart, setCart] = useState<number[]>([])

  // Filter products based on search, category, brands, and price
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand)
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice
  })

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      default:
        return 0 // Featured (no specific sort)
    }
  })

  const addToCart = (productId: number) => {
    setCart([...cart, productId])
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    })
  }

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
    } else {
      setSelectedBrands([...selectedBrands, brand])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">PC Components</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Filter className="mr-2 h-5 w-5" />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="px-1 py-4">
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="brands">
                <AccordionTrigger>Brands</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="availability">
                <AccordionTrigger>Availability</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="in-stock" />
                      <label
                        htmlFor="in-stock"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="on-sale" />
                      <label
                        htmlFor="on-sale"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        On Sale
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
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

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
