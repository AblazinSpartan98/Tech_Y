import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function StockerDashboard() {
  // Ensure user is authenticated and has stocker role
  const { session } = await requireRole(["stocker", "admin"]).catch(() => {
    redirect("/auth/login")
    return { session: null, role: null }
  })

  if (!session) {
    return null
  }

  const supabase = createClient()

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*, employees(*)")
    .eq("id", session.user.id)
    .single()

  if (userError || !userData) {
    redirect("/auth/login")
  }

  // Fetch low stock items
  const { data: lowStockItems, error: lowStockError } = await supabase
    .from("inventory")
    .select("*, products(*)")
    .lt("quantity", 10)
    .order("quantity", { ascending: true })
    .limit(5)

  // Fetch total inventory count
  const { data: inventoryCount, error: inventoryCountError } = await supabase
    .from("inventory")
    .select("id", { count: "exact", head: true })

  // Fetch recent inventory updates
  const { data: recentUpdates, error: updatesError } = await supabase
    .from("inventory")
    .select("*, products(*)")
    .order("updated_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData.full_name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory">
            <Button>Manage Inventory</Button>
          </Link>
          <Link href="/dashboard/products">
            <Button variant="outline">View Products</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryCount?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Items that need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.employees?.dni || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Your employee identification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.employees?.is_active ? "Active" : "Inactive"}</div>
            <p className="text-xs text-muted-foreground">Your current employment status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Products that need to be restocked soon</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems && lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url || "/placeholder.svg"}
                            alt={item.products.name}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="text-xs text-gray-500">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {item.product_id}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantity === 0
                            ? "bg-red-100 text-red-800"
                            : item.quantity < 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.quantity} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No low stock items</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for inventory management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/inventory/add">
              <Button className="w-full">Add Inventory</Button>
            </Link>
            <Link href="/dashboard/inventory">
              <Button variant="outline" className="w-full">
                Update Stock Levels
              </Button>
            </Link>
            <Link href="/dashboard/products/new">
              <Button variant="outline" className="w-full">
                Add New Product
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
