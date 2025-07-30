"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Edit, Save, X, Camera, Mail, Calendar, Shield, Key, CheckCircle, AlertCircle } from "lucide-react"
import { AdminNavbar } from "@/components/admin/admin-navbar"

interface AdminProfile {
  user: {
    id: number
    first_name: string
    last_name: string
    full_name: string
    email: string
    photo: string | null
    role: string
    created_at: string
    updated_at: string
  }
}

export function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
  })
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const router = useRouter()

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch("https://ifiag.pidefood.com/api/auth/profile", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setEditData({
          first_name: data.data.user.first_name,
          last_name: data.data.user.last_name,
          email: data.data.user.email,
          bio: "",
        })
      } else {
        setMessage({ type: "error", text: "Failed to load profile" })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({ type: "error", text: "Network error while loading profile" })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    setUpdateLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const formData = new FormData()
      formData.append("first_name", editData.first_name)
      formData.append("last_name", editData.last_name)
      formData.append("email", editData.email)
      if (editData.bio) formData.append("bio", editData.bio)
      if (selectedPhoto) formData.append("photo", selectedPhoto)

      const response = await fetch("https://ifiag.pidefood.com/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
        fetchProfile()
        setIsEditing(false)
        setSelectedPhoto(null)

        // Update localStorage user data
        const updatedUser = { ...profile?.user, ...editData }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Network error while updating profile" })
    } finally {
      setUpdateLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long" })
      return
    }

    setPasswordLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("https://ifiag.pidefood.com/api/auth/change-password", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.confirm_password,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" })
        setIsChangingPassword(false)
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })
      } else {
        setMessage({ type: "error", text: data.message || "Failed to change password" })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setMessage({ type: "error", text: "Network error while changing password" })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setMessage({ type: "error", text: "Photo size must be less than 5MB" })
        return
      }
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file" })
        return
      }
      setSelectedPhoto(file)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-orange-700">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-orange-700">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-900">Profile Settings</h1>
          <p className="text-orange-700 mt-1">Manage your account information and preferences</p>
        </div>

        {/* Messages */}
        {message.text && (
          <Alert
            className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal information and profile photo</CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    disabled={updateLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Profile Photo Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : profile.user.photo || undefined}
                        />
                        <AvatarFallback className="text-lg">
                          {profile.user.first_name[0]}
                          {profile.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                          <Camera className="h-4 w-4" />
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.user.full_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          {profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-orange-700">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {new Date(profile.user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={editData.first_name}
                          onChange={(e) => setEditData((prev) => ({ ...prev, first_name: e.target.value }))}
                          disabled={updateLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={editData.last_name}
                          onChange={(e) => setEditData((prev) => ({ ...prev, last_name: e.target.value }))}
                          disabled={updateLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                          disabled={updateLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <Textarea
                          id="bio"
                          value={editData.bio}
                          onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself..."
                          disabled={updateLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Button
                          onClick={updateProfile}
                          disabled={updateLoading}
                          className="mr-2 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {updateLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          disabled={updateLoading}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-orange-600">First Name</Label>
                        <p className="text-lg">{profile.user.first_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-orange-600">Last Name</Label>
                        <p className="text-lg">{profile.user.last_name}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-orange-600">Email Address</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-lg">{profile.user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-orange-700">
                        Last updated {new Date(profile.user.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      variant="outline"
                      disabled={passwordLoading}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isChangingPassword ? "Cancel" : "Change Password"}
                    </Button>
                  </div>

                  {isChangingPassword && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                          id="current_password"
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))}
                          disabled={passwordLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))}
                          disabled={passwordLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, confirm_password: e.target.value }))}
                          disabled={passwordLoading}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={changePassword}
                          disabled={passwordLoading}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {passwordLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Changing...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </Button>
                        <Button
                          onClick={() => setIsChangingPassword(false)}
                          variant="outline"
                          disabled={passwordLoading}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <Label className="text-sm font-medium text-orange-600">Account ID</Label>
                        <p className="text-sm font-mono">{profile.user.id}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <Label className="text-sm font-medium text-orange-600">Role</Label>
                        <p className="text-sm">
                          {profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1)}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <Label className="text-sm font-medium text-orange-600">Created</Label>
                        <p className="text-sm">{new Date(profile.user.created_at).toLocaleString()}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <Label className="text-sm font-medium text-orange-600">Last Updated</Label>
                        <p className="text-sm">{new Date(profile.user.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
