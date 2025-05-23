import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

// Mock data for categories
const categories = [
  {
    id: 1,
    name: "Graphics Cards",
    image: "/placeholder.svg?height=200&width=200",
    count: 24,
  },
  {
    id: 2,
    name: "Processors",
    image: "/placeholder.svg?height=200&width=200",
    count: 18,
  },
  {
    id: 3,
    name: "Motherboards",
    image: "/placeholder.svg?height=200&width=200",
    count: 32,
  },
  {
    id: 4,
    name: "Memory",
    image: "/placeholder.svg?height=200&width=200",
    count: 15,
  },
  {
    id: 5,
    name: "Storage",
    image: "/placeholder.svg?height=200&width=200",
    count: 27,
  },
  {
    id: 6,
    name: "Power Supplies",
    image: "/placeholder.svg?height=200&width=200",
    count: 21,
  },
]

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
      {categories.map((category) => (
        <Link key={category.id} href={`/products/category/${category.id}`}>
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  width={200}
                  height={200}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-200">{category.count} products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
