"use client"

import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Calendar, UserPlus, Church, Phone, MapPin, LogOut } from "lucide-react"
import Link from "next/link"

function DashboardContent() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "usher":
        return "Usher"
      case "cell_leader":
        return "Cell Leader"
      case "finance_leader":
        return "Finance Leader"
      default:
        return role
    }
  }

  const canAccessFinance = user?.role === "admin" || user?.role === "finance_leader"
  const canAccessAttendance = user?.role === "admin" || user?.role === "usher" || user?.role === "cell_leader"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg ministry-gradient flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Ministry Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {getRoleDisplay(user?.role || "")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{getRoleDisplay(user?.role || "")}</Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week's Attendance</CardTitle>
              <Church className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">70% attendance rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First-Timers</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          {canAccessFinance && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Offerings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵6,050</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Navigation */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {canAccessAttendance && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Attendance & Members</CardTitle>
                    <CardDescription>Manage attendance, members, and first-timers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start bg-transparent" asChild>
                    <Link href="/attendance">
                      <Calendar className="w-4 h-4 mr-2" />
                      Record Attendance
                    </Link>
                  </Button>
                  {user?.role === "admin" && (
                    <Button variant="outline" className="justify-start bg-transparent" asChild>
                      <Link href="/members">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Members
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {canAccessFinance && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Finance Management</CardTitle>
                    <CardDescription>Track partnerships, offerings, and financial reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start bg-transparent" asChild>
                    <Link href="/finance">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Finance
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity & Quick Info */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your ministry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New service created</p>
                    <p className="text-xs text-muted-foreground">
                      Supergathering - "Faith Over Fear" scheduled for today
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Partnership recorded</p>
                    <p className="text-xs text-muted-foreground">Min. Victus Kwaku - ₵500.00</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Attendance submitted</p>
                    <p className="text-xs text-muted-foreground">89 members present at Midweek service</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Ministry Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>026 116 9859</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>KNUST CAMPUS</p>
                    <p className="text-xs text-muted-foreground">REHABILITATION CENTER (CEDRES)</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Active Cells</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Zoe Cell</span>
                    <span className="text-muted-foreground">21 members</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shiloh Cell</span>
                    <span className="text-muted-foreground">18 members</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Makarios Cell</span>
                    <span className="text-muted-foreground">22 members</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
