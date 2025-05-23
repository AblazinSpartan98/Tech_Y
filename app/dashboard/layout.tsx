import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getUserRole, requireAuth } from "@/lib/auth"
import DashboardNav from "@/components/dashboard/dashboard-nav"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Check if user is authenticated
  const session = await requireAuth().catch(() => {
    redirect("/auth/login")
    return null
  })

  if (!session) {
    return null
  }

  // Get user role
  const role = await getUserRole()

  if (!role) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav role={role} userEmail={session.user.email || ""} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
