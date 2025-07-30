"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("https://ifiag.pidefood.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user data
        localStorage.setItem("token", data.data.access_token)
        localStorage.setItem("user", JSON.stringify(data.data.user))

        // Show success message
        setSuccess(`Welcome back, ${data.data.user.first_name}!`)

        // Redirect based on role with a small delay for better UX
        setTimeout(() => {
          // Allow both admin and student roles to access admin dashboard
          if (data.data.user.role === "admin" || data.data.user.role === "student") {
            console.log(`Redirecting ${data.data.user.role} to dashboard...`)
            router.push("/admin/dashboard")
          } else {
            // Only reject if role is completely unknown
            console.log("Unknown role, allowing access to admin dashboard...")
            router.push("/admin/dashboard")
          }
        }, 1000)
      } else {
        setError(data.message || "Invalid credentials. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">Sign In to IFIAG</CardTitle>
        <CardDescription className="text-orange-700">Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-orange-600">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-orange-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@ifiag.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-orange-100 text-orange-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-orange-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-orange-100 text-orange-900"
            />
          </div>

          <Button type="submit" className="w-full bg-orange-600 text-white hover:bg-orange-700" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />}
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center">
            <Link href="/register" className="text-sm text-orange-600 hover:underline">
              Don't have an account? Register as a student
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-orange-600">
            <p className="text-xs font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <div>
                <strong className="text-orange-900">Admin:</strong> admin@ifiag.com / admin123
              </div>
              
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
