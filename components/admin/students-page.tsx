"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react"
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

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [filters, setFilters] = useState({
    field: "all",
    class: "all",
    status: "all",
    search: "",
    per_page: "15",
    page: 1,
  })
  const [statusUpdate, setStatusUpdate] = useState({
    studentId: 0,
    status: "",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState({
    fields: [] as string[],
    classes: [] as string[],
    statuses: [] as string[],
  })
  const router = useRouter()

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("https://ifiag.pidefood.com/api/students/filters/options", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setFilterOptions(data.data)
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.field !== "all") params.append("field", filters.field)
      if (filters.class !== "all") params.append("class", filters.class)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)
      params.append("per_page", filters.per_page)
      params.append("page", filters.page.toString())

      const response = await fetch(`https://ifiag.pidefood.com/api/students?${params}`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setStudents(data.data.data)
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        })
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentDetails = async (studentId: number) => {
    try {
      const response = await fetch(`https://ifiag.pidefood.com/api/students/${studentId}`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setSelectedStudent(data.data)
      }
    } catch (error) {
      console.error("Error fetching student details:", error)
    }
  }

  const updateStudentStatus = async () => {
    try {
      const response = await fetch(`https://ifiag.pidefood.com/api/students/${statusUpdate.studentId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: statusUpdate.status,
          description: statusUpdate.description,
        }),
      })
      const data = await response.json()
      if (data.success) {
        fetchStudents()
        setStatusUpdate({ studentId: 0, status: "", description: "" })
      }
    } catch (error) {
      console.error("Error updating student status:", error)
    }
  }

  const exportStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.field !== "all") params.append("field", filters.field)
      if (filters.class !== "all") params.append("class", filters.class)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`https://ifiag.pidefood.com/api/students?${params}&per_page=1000`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()

      if (data.success) {
        const csvContent = convertToCSV(data.data.data)
        downloadCSV(csvContent, "students.csv")
      }
    } catch (error) {
      console.error("Error exporting students:", error)
    }
  }

  const convertToCSV = (data: Student[]) => {
    const headers = [
      "Student ID",
      "Full Name",
      "Email",
      "Phone",
      "Field",
      "Class",
      "Status",
      "Gender",
      "Birth Date",
      "Enrollment Date",
    ]

    const rows = data.map((student) => [
      student.student_id,
      student.user.full_name,
      student.user.email,
      student.phone,
      student.field,
      student.class,
      student.status,
      student.gender,
      student.birth_date,
      student.enrollment_date,
    ])

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [filters])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add a page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-900">Students Management</h1>
          <p className="text-orange-700">Manage all student accounts and information</p>
        </div>
        {/* Rest of the content remains the same */}
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10"
                />
              </div>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, field: value, page: 1 }))}>
                <SelectTrigger className="bg-orange-50 border-orange-300 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {filterOptions.fields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, class: value, page: 1 }))}>
                <SelectTrigger className="bg-orange-50 border-orange-300 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {filterOptions.classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}>
                <SelectTrigger className="bg-orange-50 border-orange-300 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {filterOptions.statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, per_page: value, page: 1 }))}>
                <SelectTrigger className="bg-orange-50 border-orange-300 focus:ring-orange-500 focus:border-orange-500">
                  <SelectValue placeholder="15 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="15">15 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Students ({pagination?.total || 0})
                </CardTitle>
                <CardDescription>
                  {pagination && `Showing ${pagination.from}-${pagination.to} of ${pagination.total} students`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.user.photo || undefined} />
                      <AvatarFallback>
                        {student.user.first_name[0]}
                        {student.user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{student.user.full_name}</h3>
                      <p className="text-sm text-orange-700">{student.student_id}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-orange-700">{student.user.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-orange-700">{student.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{student.field}</Badge>
                        <Badge variant="outline">{student.class}</Badge>
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 focus:ring-orange-500 focus:border-orange-500"
                          onClick={() => fetchStudentDetails(student.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Student Details</DialogTitle>
                          <DialogDescription>Complete information about the student</DialogDescription>
                        </DialogHeader>
                        {selectedStudent && (
                          <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={selectedStudent.user.photo || undefined} />
                                <AvatarFallback className="text-lg">
                                  {selectedStudent.user.first_name[0]}
                                  {selectedStudent.user.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-semibold">{selectedStudent.user.full_name}</h3>
                                <p className="text-orange-700">{selectedStudent.student_id}</p>
                                <Badge className={getStatusColor(selectedStudent.status)}>
                                  {selectedStudent.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Email</Label>
                                  <p>{selectedStudent.user.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Phone</Label>
                                  <p>{selectedStudent.phone || "Not provided"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Gender</Label>
                                  <p>{selectedStudent.gender}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Birth Date</Label>
                                  <p>{new Date(selectedStudent.birth_date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Field</Label>
                                  <p>{selectedStudent.field}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Class</Label>
                                  <p>{selectedStudent.class}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Birth Place</Label>
                                  <p>{selectedStudent.birth_place || "Not provided"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-orange-600">Enrollment Date</Label>
                                  <p>{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>

                            {selectedStudent.address && (
                              <div>
                                <Label className="text-sm font-medium text-orange-600">Address</Label>
                                <p>{selectedStudent.address}</p>
                              </div>
                            )}

                            {selectedStudent.description && (
                              <div>
                                <Label className="text-sm font-medium text-orange-600">Description</Label>
                                <p>{selectedStudent.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 focus:ring-orange-500 focus:border-orange-500"
                          onClick={() =>
                            setStatusUpdate({
                              studentId: student.id,
                              status: student.status,
                              description: student.description,
                            })
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Student Status</DialogTitle>
                          <DialogDescription>Change the status of {student.user.full_name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="status" className="text-orange-600">
                              Status
                            </Label>
                            <Select
                              value={statusUpdate.status}
                              onValueChange={(value) => setStatusUpdate((prev) => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="bg-orange-50 border-orange-300 focus:ring-orange-500 focus:border-orange-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="graduated">Graduated</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="description" className="text-orange-600">
                              Description
                            </Label>
                            <Textarea
                              value={statusUpdate.description}
                              onChange={(e) => setStatusUpdate((prev) => ({ ...prev, description: e.target.value }))}
                              placeholder="Add a note about this status change..."
                            />
                          </div>
                          <Button
                            onClick={updateStudentStatus}
                            className="w-full bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500"
                          >
                            Update Status
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-orange-700">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 focus:ring-orange-500 focus:border-orange-500"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={pagination.current_page === page ? "default" : "outline"}
                          size="sm"
                          className={
                            pagination.current_page === page
                              ? "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500"
                              : "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 focus:ring-orange-500 focus:border-orange-500"
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 focus:ring-orange-500 focus:border-orange-500"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
