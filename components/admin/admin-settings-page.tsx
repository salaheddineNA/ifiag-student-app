"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Bell,
  Database,
  Users,
  Shield,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react"
import { AdminNavbar } from "@/components/admin/admin-navbar"

interface SystemSettings {
  site_name: string
  site_description: string
  admin_email: string
  max_students: number
  auto_approve_students: boolean
  email_notifications: boolean
  maintenance_mode: boolean
  backup_frequency: string
  theme_color: string
  language: string
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: "IFIAG Student Management",
    site_description: "Institut de Formation en Informatique et Administration de Gestion",
    admin_email: "admin@ifiag.com",
    max_students: 1000,
    auto_approve_students: false,
    email_notifications: true,
    maintenance_mode: false,
    backup_frequency: "daily",
    theme_color: "orange",
    language: "fr",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    database_size: "0 MB",
    last_backup: "Never",
  })

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Save to localStorage for demo
      localStorage.setItem("system_settings", JSON.stringify(settings))

      setMessage({ type: "success", text: "Settings saved successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const data = {
        settings,
        stats,
        exported_at: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ifiag-settings-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Settings exported successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to export settings" })
    }
  }

  const performBackup = async () => {
    setLoading(true)
    try {
      // Simulate backup process
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStats((prev) => ({ ...prev, last_backup: new Date().toLocaleString() }))
      setMessage({ type: "success", text: "Backup completed successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Backup failed" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("system_settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Load stats (simulated)
    setStats({
      total_users: 156,
      total_students: 142,
      database_size: "45.2 MB",
      last_backup: "2024-01-15 14:30:00",
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-900">System Settings</h1>
          <p className="text-orange-700 mt-1">Configure system preferences and manage application settings</p>
        </div>

        {/* Messages */}
        {message.text && (
          <Alert
            className={`mb-6 ${
              message.type === "success" ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-orange-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-orange-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Users
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              System
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Backup
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <Settings className="mr-2 h-5 w-5 text-orange-600" />
                  General Settings
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Configure basic application settings and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site_name" className="text-orange-900">
                      Site Name
                    </Label>
                    <Input
                      id="site_name"
                      value={settings.site_name}
                      onChange={(e) => handleSettingChange("site_name", e.target.value)}
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_email" className="text-orange-900">
                      Admin Email
                    </Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={settings.admin_email}
                      onChange={(e) => handleSettingChange("admin_email", e.target.value)}
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description" className="text-orange-900">
                    Site Description
                  </Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleSettingChange("site_description", e.target.value)}
                    className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme_color" className="text-orange-900">
                      Theme Color
                    </Label>
                    <Select
                      value={settings.theme_color}
                      onValueChange={(value) => handleSettingChange("theme_color", value)}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-orange-900">
                      Language
                    </Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Settings */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <Users className="mr-2 h-5 w-5 text-orange-600" />
                  User Management Settings
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Configure user registration and management options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="max_students" className="text-orange-900">
                    Maximum Students
                  </Label>
                  <Input
                    id="max_students"
                    type="number"
                    value={settings.max_students}
                    onChange={(e) => handleSettingChange("max_students", Number.parseInt(e.target.value))}
                    className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <p className="text-sm text-orange-600">Maximum number of students that can register</p>
                </div>

                <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-orange-900">Auto-approve Students</h4>
                    <p className="text-sm text-orange-700">Automatically approve new student registrations</p>
                  </div>
                  <Switch
                    checked={settings.auto_approve_students}
                    onCheckedChange={(checked) => handleSettingChange("auto_approve_students", checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700">Total Users</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.total_users}</p>
                      </div>
                      <Users className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                  <div className="p-4 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700">Total Students</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.total_students}</p>
                      </div>
                      <Users className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <Bell className="mr-2 h-5 w-5 text-orange-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-orange-700">Configure email and system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-orange-900">Email Notifications</h4>
                    <p className="text-sm text-orange-700">Send email notifications for important events</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleSettingChange("email_notifications", checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-orange-900">Notification Types</h4>
                  <div className="space-y-3">
                    {[
                      { id: "new_registration", label: "New Student Registration", enabled: true },
                      { id: "status_change", label: "Student Status Changes", enabled: true },
                      { id: "system_alerts", label: "System Alerts", enabled: false },
                      { id: "backup_reports", label: "Backup Reports", enabled: true },
                    ].map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-center justify-between p-3 border border-orange-100 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-orange-900">{notification.label}</p>
                        </div>
                        <Switch checked={notification.enabled} className="data-[state=checked]:bg-orange-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <Shield className="mr-2 h-5 w-5 text-orange-600" />
                  System Settings
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Configure system security and maintenance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-orange-900">Maintenance Mode</h4>
                    <p className="text-sm text-orange-700">Put the system in maintenance mode</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.maintenance_mode ? "destructive" : "secondary"}>
                      {settings.maintenance_mode ? "ON" : "OFF"}
                    </Badge>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => handleSettingChange("maintenance_mode", checked)}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700">Database Size</p>
                        <p className="text-xl font-bold text-orange-900">{stats.database_size}</p>
                      </div>
                      <Database className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                  <div className="p-4 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700">System Status</p>
                        <p className="text-xl font-bold text-green-600">Healthy</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-900">
                  <Database className="mr-2 h-5 w-5 text-orange-600" />
                  Backup & Data Management
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Configure backup settings and manage data exports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="backup_frequency" className="text-orange-900">
                    Backup Frequency
                  </Label>
                  <Select
                    value={settings.backup_frequency}
                    onValueChange={(value) => handleSettingChange("backup_frequency", value)}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-orange-900">Last Backup</h4>
                      <p className="text-sm text-orange-700">{stats.last_backup}</p>
                    </div>
                    <Button
                      onClick={performBackup}
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Backing up...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Backup Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={exportData}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
