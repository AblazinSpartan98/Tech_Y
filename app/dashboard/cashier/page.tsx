import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function CashierDashboard() {
  // Ensure user is authenticated and has cashier role
  const { session } = await requireRole(["cashier", "admin"]).catch(() => {
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

  // Fetch recent orders processed by this cashier
  const { data: recentOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .eq("cashier_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch total orders processed today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayOrders, error: todayOrdersError } = await supabase
    .from("orders")
    .select("id")
    .eq("cashier_id", session.user.id)
    .gte("created_at", today.toISOString())

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cashier Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData.full_name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pos">
            <Button>Point of Sale</Button>
          </Link>
          <Link href="/dashboard/products">
            <Button variant="outline">View Products</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Orders processed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All-time orders processed</p>
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
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Orders you've recently processed</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                      <p className="text-sm">
                        {order.order_items[0].count} items • ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No transactions yet</p>
                <Link href="/dashboard/pos">
                  <Button variant="link">Go to Point of Sale</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for cashiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/pos">
              <Button className="w-full">New Transaction</Button>
            </Link>
            <Link href="/dashboard/products">
              <Button variant="outline" className="w-full">
                Check Product Prices
              </Button>
            </Link>
            <Link href="/dashboard/inventory">
              <Button variant="outline" className="w-full">
                Check Inventory
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
