"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Calendar,
  UserPlus,
  Church,
  Phone,
  MapPin,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

function DashboardContent() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    weeklyAttendance: 0,
    monthlyFirstTimers: 0,
    monthlyOfferings: 0,
    activities: [], // Changed from recentActivities to match API
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [cellStats, setCellStats] = useState([]); // Added separate state for cell stats

  useEffect(() => {
    fetchDashboardData();
    fetchCellStats(); // Added to fetch cell stats
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Added function to fetch cell stats
  const fetchCellStats = async () => {
    try {
      const response = await fetch("/api/cells");
      if (response.ok) {
        const data = await response.json();
        setCellStats(data);
      }
    } catch (error) {
      console.error("Error fetching cell stats:", error);
    }
  };

  const isDataFresh = () => {
    if (!stats.lastUpdated) return false;
    const lastUpdate = new Date(stats.lastUpdated);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    return diffInMinutes < 1; // Data is fresh if less than 1 minute old
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "usher":
        return "Usher";
      case "cell_leader":
        return "Cell Leader";
      case "finance_leader":
        return "Finance Leader";
      default:
        return role;
    }
  };

  const canAccessFinance =
    user?.role === "admin" || user?.role === "finance_leader";
  const canAccessAttendance =
    user?.role === "admin" ||
    user?.role === "usher" ||
    user?.role === "cell_leader";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                <p className="text-sm text-muted-foreground">
                  Welcome back, {getRoleDisplay(user?.role || "")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {getRoleDisplay(user?.role || "")}
              </Badge>
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
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Week's Attendance
              </CardTitle>
              <Church className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyAttendance}</div>
              <p className="text-xs text-muted-foreground">Present this week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                First-Timers
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.monthlyFirstTimers}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          {canAccessFinance && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Offerings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{stats.monthlyOfferings.toLocaleString()}
                </div>
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
                    <CardTitle className="text-xl">
                      Attendance & Members
                    </CardTitle>
                    <CardDescription>
                      Manage attendance, members, and first-timers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start bg-transparent"
                    asChild
                  >
                    <Link href="/attendance">
                      <Calendar className="w-4 h-4 mr-2" />
                      Record Attendance
                    </Link>
                  </Button>
                  {user?.role === "admin" && (
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      asChild
                    >
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
                    <CardTitle className="text-xl">
                      Finance Management
                    </CardTitle>
                    <CardDescription>
                      Track partnerships, offerings, and financial reports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start bg-transparent"
                    asChild
                  >
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
              <CardDescription>
                Latest updates from your ministry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.activities.map((activity: any, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "service"
                          ? "bg-primary"
                          : activity.type === "offering"
                          ? "bg-secondary"
                          : "bg-chart-3"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.type === "service"
                          ? "New service created"
                          : activity.type === "offering"
                          ? "Offering recorded"
                          : "Attendance submitted"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
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
                    <p className="text-xs text-muted-foreground">
                      REHABILITATION CENTER (CEDRES)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Active Cells</h4>
                <div className="space-y-1 text-sm">
                  {cellStats.map((cell: any, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{cell.name}</span>
                      <span className="text-muted-foreground">
                        {cell.member_count} members
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
