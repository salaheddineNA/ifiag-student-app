"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, UserCheck, UserX, TrendingUp, PieChart, BarChart3, Calendar, Award } from "lucide-react"
import { AdminNavbar } from "@/components/admin/admin-navbar"

interface Statistics {
  total_students: number
  by_field: Record<string, number>
  by_status: Record<string, number>
  by_gender: Record<string, number>
  recent_enrollments: number
}

interface Student {
  id: number
  student_id: string
  field: string
  class: string
  status: string
  enrollment_date: string
  user: {
    full_name: string
    created_at: string
  }
}

export function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [recentStudents, setRecentStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  const fetchRecentStudents = async () => {
    try {
      const response = await fetch("https://ifiag.pidefood.com/api/students?per_page=10&page=1", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        // Sort by creation date to get most recent
        const sortedStudents = data.data.data.sort(
          (a: Student, b: Student) => new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime(),
        )
        setRecentStudents(sortedStudents.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching recent students:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchStatistics(), fetchRecentStudents()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600"
      case "inactive":
        return "text-red-600"
      case "graduated":
        return "text-blue-600"
      case "dropped":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-4 w-4 text-green-600" />
      case "inactive":
        return <UserX className="h-4 w-4 text-red-600" />
      case "graduated":
        return <Award className="h-4 w-4 text-blue-600" />
      case "dropped":
        return <UserX className="h-4 w-4 text-gray-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!statistics) {
    return <div className="flex items-center justify-center min-h-screen">Error loading statistics</div>
  }

  const totalByField = Object.values(statistics.by_field).reduce((sum, count) => sum + count, 0)
  const totalByStatus = Object.values(statistics.by_status).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add a page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-900">Statistics & Analytics</h1>
          <p className="text-orange-700">Comprehensive overview of student data and trends</p>
        </div>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_students}</div>
              <p className="text-xs text-muted-foreground">+{statistics.recent_enrollments} this month</p>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graduated</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.by_status.graduated || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(((statistics.by_status.graduated || 0) / statistics.total_students) * 100).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.recent_enrollments}</div>
              <p className="text-xs text-muted-foreground">New students this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Field Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5 text-orange-500" />
                Students by Field
              </CardTitle>
              <CardDescription>Distribution of students across different fields of study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(statistics.by_field).map(([field, count]) => (
                <div key={field} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{field}</span>
                    <span className="text-sm text-orange-700">
                      {count} ({((count / totalByField) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(count / totalByField) * 100} className="h-2 bg-orange-200" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />
                Students by Status
              </CardTitle>
              <CardDescription>Current status distribution of all students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(statistics.by_status).map(([status, count]) => (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    <span className="text-sm text-orange-700">
                      {count} ({((count / totalByStatus) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(count / totalByStatus) * 100} className="h-2 bg-orange-200" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                Gender Distribution
              </CardTitle>
              <CardDescription>Student distribution by gender</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(statistics.by_gender).map(([gender, count]) => (
                <div key={gender} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{gender === "M" ? "Male" : "Female"}</span>
                    <span className="text-sm text-orange-700">
                      {count} ({((count / statistics.total_students) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(count / statistics.total_students) * 100} className="h-2 bg-orange-200" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-orange-500" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>Latest students who joined the institute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{student.user.full_name}</h4>
                      <p className="text-sm text-orange-700">{student.student_id}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{student.field}</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{student.class}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(student.status)}
                        <span className={`text-sm capitalize ${getStatusColor(student.status)}`}>{student.status}</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        {new Date(student.user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrollment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">+{statistics.recent_enrollments}</div>
              <p className="text-sm text-orange-700">New enrollments this month</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Monthly Target: 20</span>
                  <span>{((statistics.recent_enrollments / 20) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(statistics.recent_enrollments / 20) * 100} className="mt-2 bg-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {(
                  (((statistics.by_status.active || 0) + (statistics.by_status.graduated || 0)) /
                    statistics.total_students) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-sm text-orange-700">Active + Graduated students</p>
              <div className="mt-4 text-sm text-orange-700">
                <div>Active: {statistics.by_status.active || 0}</div>
                <div>Graduated: {statistics.by_status.graduated || 0}</div>
                <div>
                  Inactive/Dropped: {(statistics.by_status.inactive || 0) + (statistics.by_status.dropped || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Field Popularity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statistics.by_field)
                  .sort(([, a], [, b]) => b - a)
                  .map(([field, count], index) => (
                    <div key={field} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="text-sm font-medium">{field}</span>
                      </div>
                      <span className="text-sm text-orange-700">{count} students</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
