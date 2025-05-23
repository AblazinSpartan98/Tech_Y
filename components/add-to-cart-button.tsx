"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  Codigo: string
  "Nombre del producto": string
  "Precio unitario": number
}

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  disabled?: boolean
  className?: string
}

export default function AddToCartButton({
  product,
  quantity = 1,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { toast } = useToast()

  const addToCart = () => {
    if (disabled) return

    setIsAdding(true)

    try {
      // Obtener el carrito actual del localStorage
      const currentCart = localStorage.getItem("cart")
      const cart = currentCart ? JSON.parse(currentCart) : []

      // Verificar si el producto ya está en el carrito
      const existingItemIndex = cart.findIndex((item: any) => item.codigo === product.Codigo)

      if (existingItemIndex >= 0) {
        // Si ya existe, incrementar la cantidad
        cart[existingItemIndex].cantidad += quantity
      } else {
        // Si no existe, añadirlo al carrito
        cart.push({
          codigo: product.Codigo,
          nombre: product["Nombre del producto"],
          precio: product["Precio unitario"],
          cantidad: quantity,
        })
      }

      // Guardar el carrito actualizado
      localStorage.setItem("cart", JSON.stringify(cart))

      // Mostrar mensaje de éxito
      toast({
        title: "Producto agregado",
        description: `${product["Nombre del producto"]} se ha agregado al carrito`,
      })

      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      console.error("Error al añadir al carrito:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      onClick={addToCart}
      disabled={isAdding || disabled}
      className={className}
      variant={disabled ? "outline" : "default"}
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Añadido
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? "Añadiendo..." : disabled ? "Sin stock" : "Añadir al carrito"}
        </>
      )}
    </Button>
  )
}
