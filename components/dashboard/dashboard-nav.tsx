"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, Box, ClipboardList, Home, LogOut, Menu, Package, ShoppingCart, User, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface DashboardNavProps {
  role: string
  userEmail: string
}

export default function DashboardNav({ role, userEmail }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    router.push("/")
    router.refresh()
  }

  // Define navigation items based on user role
  const navItems = [
    {
      title: "Dashboard",
      href: `/dashboard/${role}`,
      icon: <Home className="h-5 w-5" />,
      roles: ["customer", "cashier", "stocker", "admin"],
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5" />,
      roles: ["customer", "cashier", "stocker", "admin"],
    },
    {
      title: "My Orders",
      href: "/dashboard/orders",
      icon: <ClipboardList className="h-5 w-5" />,
      roles: ["customer", "admin"],
    },
    {
      title: "Cart",
      href: "/cart",
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ["customer", "admin"],
    },
    {
      title: "Point of Sale",
      href: "/dashboard/pos",
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ["cashier", "admin"],
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: <Box className="h-5 w-5" />,
      roles: ["stocker", "admin"],
    },
    {
      title: "Employees",
      href: "/dashboard/employees",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
      roles: ["customer", "cashier", "stocker", "admin"],
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-bold text-xl hidden sm:inline-block">TechComponents</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6">
          {filteredNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:block text-sm text-muted-foreground">
            {userEmail} ({role})
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="font-bold text-xl">TechComponents</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="p-4 space-y-4">
            {filteredNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            ))}
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                {userEmail} ({role})
              </div>
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
