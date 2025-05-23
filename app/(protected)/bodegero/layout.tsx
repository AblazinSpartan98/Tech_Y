import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/app/actions/auth"
import { MainNav } from "@/components/layout/main-nav"

export default async function BodegeroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.role !== "bodegero") {
    redirect("/unauthorized")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav role="bodegero" userId={session.id} userName={session.name} />
      <main className="flex-1 p-4 md:p-6 bg-gray-50">{children}</main>
    </div>
  )
}
