"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, GraduationCap, UserCheck, Search, Filter, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminNavbar } from "@/components/admin/admin-navbar"

interface Student {
  id: number
  student_id: string
  phone: string
  birth_date: string
  gender: string
  birth_place: string
  address: string
  class: string
  field: string
  enrollment_date: string
  status: string
  description: string
  user: {
    id: number
    first_name: string
    last_name: string
    full_name: string
    email: string
    photo: string | null
    role: string
  }
  full_name: string
  created_at: string
  updated_at: string
}

interface Statistics {
  total_students: number
  by_field: Record<string, number>
  by_status: Record<string, number>
  by_gender: Record<string, number>
  recent_enrollments: number
}

interface AdminUser {
  first_name: string
  last_name: string
  full_name: string
  email: string
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [filters, setFilters] = useState({
    field: "all",
    class: "all",
    status: "all",
    search: "",
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setAdminUser(JSON.parse(userData))
    }
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch("https://ifiag.pidefood.com/api/students/statistics/overview", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error("Error fetching statistics:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.field !== "all") params.append("field", filters.field)
      if (filters.class !== "all") params.append("class", filters.class)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)
      params.append("per_page", "10") // Limit to 10 for dashboard

      const response = await fetch(`https://ifiag.pidefood.com/api/students?${params}`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setStudents(data.data.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const updateStudentStatus = async (studentId: number, status: string) => {
    try {
      const response = await fetch(`https://ifiag.pidefood.com/api/students/${studentId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (data.success) {
        fetchStudents()
        fetchStatistics()
      }
    } catch (error) {
      console.error("Error updating student status:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStatistics(), fetchStudents()])
      setLoading(false)
    }
    loadData()
  }, [filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "graduated":
        return "bg-blue-100 text-blue-800"
      case "dropped":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-900">
                {getGreeting()}, {adminUser?.first_name || "Admin"}! 👋
              </h1>
              <p className="text-orange-700 mt-1">Welcome to your IFIAG administration dashboard</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              {currentTime.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_students}</div>
                <p className="text-xs text-muted-foreground">+{statistics.recent_enrollments} new this month</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.by_status.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(((statistics.by_status.active || 0) / statistics.total_students) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Computer Science</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.by_field["Computer Science"] || 0}</div>
                <p className="text-xs text-muted-foreground">Students enrolled</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Networks</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.by_field.Networks || 0}</div>
                <p className="text-xs text-muted-foreground">Students enrolled</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Quick Filters
            </CardTitle>
            <CardDescription>Filter students to get a quick overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, field: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Networks">Networks</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="1st Year Computer Science">1st Year Computer Science</SelectItem>
                  <SelectItem value="1st Year Networks">1st Year Networks</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Students ({students.length})</CardTitle>
                <CardDescription>Latest student registrations and updates</CardDescription>
              </div>
              <div
                className="text-sm text-orange-600 hover:text-orange-800 cursor-pointer"
                onClick={() => router.push("/admin/students")}
              >
                View all →
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.length > 0 ? (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={student.user.photo || undefined} />
                        <AvatarFallback>
                          {student.user.first_name[0]}
                          {student.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{student.user.full_name}</h3>
                        <p className="text-sm text-gray-600">{student.student_id}</p>
                        <p className="text-sm text-gray-600">{student.user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{student.field}</Badge>
                          <Badge variant="outline">{student.class}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      <Select onValueChange={(value) => updateStudentStatus(student.id, value)}>
                        <SelectTrigger className="w-32 bg-orange-600 hover:bg-orange-700 text-white">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="graduated">Graduated</SelectItem>
                          <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No students found with current filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
