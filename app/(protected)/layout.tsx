import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/app/actions/auth"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login?error=Debe iniciar sesión para acceder a esta página")
  }

  return <div className="flex flex-col min-h-screen">{children}</div>
}
