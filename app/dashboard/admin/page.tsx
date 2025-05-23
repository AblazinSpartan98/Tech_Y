import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  // Ensure user is authenticated and has admin role
  const { session } = await requireRole(["admin"]).catch(() => {
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

  // Fetch employee count
  const { data: employeeCount, error: employeeCountError } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })

  // Fetch product count
  const { data: productCount, error: productCountError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })

  // Fetch order count
  const { data: orderCount, error: orderCountError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })

  // Fetch recent orders
  const { data: recentOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*, users(full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent employees
  const { data: recentEmployees, error: employeesError } = await supabase
    .from("employees")
    .select("*, users(full_name, role)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData.full_name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/employees">
            <Button>Manage Employees</Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="outline">View Reports</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Processed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.employees?.is_active ? "Active" : "Inactive"}</div>
            <p className="text-xs text-muted-foreground">Your current status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions in the system</CardDescription>
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
                        Customer: {order.users?.full_name || "Unknown"} • ${order.total_amount.toFixed(2)}
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
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
            <CardDescription>Latest staff members added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEmployees && recentEmployees.length > 0 ? (
              <div className="space-y-4">
                {recentEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{employee.users?.full_name}</p>
                      <p className="text-sm text-muted-foreground">DNI: {employee.dni}</p>
                      <p className="text-sm">
                        Role: {employee.users?.role.charAt(0).toUpperCase() + employee.users?.role.slice(1)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No employees yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage your staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/employees">
              <Button className="w-full">View All Employees</Button>
            </Link>
            <Link href="/dashboard/employees/new">
              <Button variant="outline" className="w-full">
                Add New Employee
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Manage your products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/inventory">
              <Button className="w-full">View Inventory</Button>
            </Link>
            <Link href="/dashboard/products/new">
              <Button variant="outline" className="w-full">
                Add New Product
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sales & Reports</CardTitle>
            <CardDescription>View business performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/reports">
              <Button className="w-full">View Reports</Button>
            </Link>
            <Link href="/dashboard/pos">
              <Button variant="outline" className="w-full">
                Point of Sale
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
