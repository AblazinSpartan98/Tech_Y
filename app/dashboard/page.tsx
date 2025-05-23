import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth"

export default async function DashboardPage() {
  const role = await getUserRole()

  // Redirect to role-specific dashboard
  if (role === "admin") {
    redirect("/dashboard/admin")
  } else if (role === "cashier") {
    redirect("/dashboard/cashier")
  } else if (role === "stocker") {
    redirect("/dashboard/stocker")
  } else if (role === "customer") {
    redirect("/dashboard/customer")
  }

  // If no role or not logged in, redirect to login
  redirect("/auth/login")
}
