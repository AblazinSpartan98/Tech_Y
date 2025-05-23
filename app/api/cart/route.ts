import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { executeQuery, getOne } from "@/lib/mysql"

// Tipo para los items del carrito
interface CartItem {
  codigo: string
  cantidad: number
}

// Función para obtener el carrito actual
async function getCart(): Promise<CartItem[]> {
  const cartCookie = cookies().get("cart")?.value
  if (!cartCookie) return []

  try {
    return JSON.parse(cartCookie)
  } catch (error) {
    console.error("Error parsing cart cookie:", error)
    return []
  }
}

// Función para guardar el carrito
function saveCart(cart: CartItem[]) {
  cookies().set("cart", JSON.stringify(cart), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  })
}

export async function GET() {
  try {
    const cart = await getCart()

    // Si el carrito está vacío, devolver array vacío
    if (cart.length === 0) {
      return NextResponse.json({ items: [], total: 0 })
    }

    // Obtener detalles de los productos en el carrito
    const productCodes = cart.map((item) => item.codigo)
    const placeholders = productCodes.map(() => "?").join(",")

    const products = (await executeQuery(
      `SELECT codigo, nombre, precio, stock, imagen FROM Producto WHERE codigo IN (${placeholders})`,
      productCodes,
    )) as any[]

    // Mapear productos con cantidades
    const items = cart
      .map((cartItem) => {
        const product = products.find((p) => p.codigo === cartItem.codigo)
        if (!product) return null

        return {
          ...product,
          cantidad: cartItem.cantidad,
          subtotal: product.precio * cartItem.cantidad,
        }
      })
      .filter(Boolean)

    // Calcular total
    const total = items.reduce((sum, item) => sum + item.subtotal, 0)

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error("Error getting cart:", error)
    return NextResponse.json({ error: "Error al obtener el carrito" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { codigo, cantidad } = await request.json()

    // Validar datos
    if (!codigo || !cantidad || cantidad <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Verificar si el producto existe y tiene stock
    const product = await getOne("SELECT codigo, stock FROM Producto WHERE codigo = ?", [codigo])

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    if (product.stock < cantidad) {
      return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 })
    }

    // Obtener carrito actual
    const cart = await getCart()

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex((item) => item.codigo === codigo)

    if (existingItemIndex >= 0) {
      // Actualizar cantidad
      cart[existingItemIndex].cantidad += cantidad
    } else {
      // Añadir nuevo item
      cart.push({ codigo, cantidad })
    }

    // Guardar carrito
    saveCart(cart)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Error al añadir al carrito" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { codigo, cantidad } = await request.json()

    // Validar datos
    if (!codigo || !cantidad || cantidad < 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Obtener carrito actual
    const cart = await getCart()

    // Si la cantidad es 0, eliminar el item
    if (cantidad === 0) {
      const newCart = cart.filter((item) => item.codigo !== codigo)
      saveCart(newCart)
      return NextResponse.json({ success: true })
    }

    // Verificar si el producto existe y tiene stock
    const product = await getOne("SELECT codigo, stock FROM Producto WHERE codigo = ?", [codigo])

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    if (product.stock < cantidad) {
      return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 })
    }

    // Actualizar cantidad
    const existingItemIndex = cart.findIndex((item) => item.codigo === codigo)

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].cantidad = cantidad
    } else {
      // Si no existe, añadir nuevo item
      cart.push({ codigo, cantidad })
    }

    // Guardar carrito
    saveCart(cart)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Error al actualizar el carrito" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get("codigo")

    // Si no hay código, vaciar todo el carrito
    if (!codigo) {
      saveCart([])
      return NextResponse.json({ success: true })
    }

    // Eliminar item específico
    const cart = await getCart()
    const newCart = cart.filter((item) => item.codigo !== codigo)
    saveCart(newCart)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting from cart:", error)
    return NextResponse.json({ error: "Error al eliminar del carrito" }, { status: 500 })
  }
}
