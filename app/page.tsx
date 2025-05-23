import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, Cpu, Monitor, HardDrive, Smartphone } from "lucide-react"
import { executeQuery } from "@/lib/db"

// Función para obtener productos destacados
async function getFeaturedProducts() {
  try {
    const products = await executeQuery(
      "SELECT * FROM Producto WHERE Cantidad > 0 ORDER BY `Precio unitario` DESC LIMIT 4",
    )
    return products
  } catch (error) {
    console.error("Error al obtener productos destacados:", error)
    return []
  }
}

// Función para obtener tipos de productos
async function getProductTypes() {
  try {
    const types = await executeQuery("SELECT DISTINCT Tipo FROM Producto ORDER BY Tipo ASC LIMIT 6")
    return types
  } catch (error) {
    console.error("Error al obtener tipos de productos:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()
  const productTypes = await getProductTypes()

  // Mapeo de categorías a iconos
  const categoryIcons: Record<string, any> = {
    "Tarjeta de video": Cpu,
    Procesador: Cpu,
    Disco: HardDrive,
    Tarjeta: Package,
    Monitor: Monitor,
    Memoria: Package,
    "Tarjeta madre": Package,
    Teclado: Smartphone,
    Mouse: Smartphone,
    Laptop: Monitor,
    PC: Monitor,
    Discipador: Package,
  }

  return (
    <div className="flex flex-col min-h-screen">
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Componentes de PC y Tecnología</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Encuentra los mejores componentes para tu PC y dispositivos tecnológicos al mejor precio.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/productos">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Ver Productos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Categorías Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {productTypes && productTypes.length > 0 ? (
                productTypes.map((type: any, index) => {
                  const categoryName = type.Tipo || "Otros"
                  const IconComponent = categoryIcons[categoryName] || Package

                  return (
                    <Link href={`/productos?tipo=${categoryName}`} key={index}>
                      <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
                        <IconComponent className="h-10 w-10 mx-auto text-primary mb-4" />
                        <h3 className="font-medium">{categoryName}</h3>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p>No se encontraron categorías disponibles.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Productos Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.map((product: any) => (
                  <div key={product.Codigo} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product["Nombre del producto"]}</h3>
                      <p className="text-gray-500 mb-2">{product.Tipo}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl">${product["Precio unitario"]}</span>
                        <span className="text-sm text-green-600">{product.Cantidad} disponibles</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t">
                      <Link href={`/productos/${product.Codigo}`}>
                        <Button className="w-full">Ver Detalles</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p>No se encontraron productos destacados.</p>
                </div>
              )}
            </div>
            <div className="text-center mt-8">
              <Link href="/productos">
                <Button size="lg">Ver Todos los Productos</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comprar?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Compra en línea con envío a todo el país o visita nuestra tienda física.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Iniciar Compra
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Tech-Y</h3>
              <p className="text-gray-300">Tu tienda de confianza para componentes de PC y tecnología.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/productos" className="text-gray-300 hover:text-white">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-white">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/registro" className="text-gray-300 hover:text-white">
                    Crear Cuenta
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contacto</h3>
              <p className="text-gray-300">
                Av. Tecnológica #123
                <br />
                Ciudad de México, México
                <br />
                Tel: (55) 1234-5678
                <br />
                Email: info@tech-y.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Tech-Y. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
