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
  Calendar,
  UserPlus,
  Church,
  Phone,
  MapPin,
  LogOut,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

function DashboardContent() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAssociates: 0,
    totalFirstTimers: 0,
    lastServiceAttendance: 0,
    lastServiceDate: null,
    activities: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [cellStats, setCellStats] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
    fetchCellStats();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const canAccessFinance = ["admin", "finance_leader", "cell_leader"].includes(
    user?.role
  );

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
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <img
                  src="/Logo-cw.png"
                  alt="Charisword Gospel Ministry"
                  className="w-8 h-8 object-contain"
                />
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
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className="justify-start"
          >
            Overview
          </Button>
          {canAccessAttendance && (
            <Button
              variant={activeTab === "attendance" ? "default" : "ghost"}
              onClick={() => setActiveTab("attendance")}
              className="justify-start"
            >
              Attendance
            </Button>
          )}
          {user?.role === "admin" && (
            <Button
              variant={activeTab === "services" ? "default" : "ghost"}
              onClick={() => setActiveTab("services")}
              className="justify-start"
            >
              Services
            </Button>
          )}
          {canAccessFinance && (
            <Button
              variant={activeTab === "finance" ? "default" : "ghost"}
              onClick={() => setActiveTab("finance")}
              className="justify-start"
            >
              Finance
            </Button>
          )}
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <>
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
                  <p className="text-xs text-muted-foreground">
                    Active members
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Associates
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalAssociates}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Associate members
                  </p>
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
                    {stats.totalFirstTimers}
                  </div>
                  <p className="text-xs text-muted-foreground">New visitors</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Service
                  </CardTitle>
                  <Church className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.lastServiceAttendance}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.lastServiceDate
                      ? new Date(stats.lastServiceDate).toLocaleDateString()
                      : "No recent service"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest membership and attendance updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.activities
                      .filter(
                        (activity) =>
                          activity.type === "attendance" ||
                          activity.type === "member" ||
                          activity.type === "service"
                      )
                      .map((activity: any, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "service"
                                ? "bg-primary"
                                : activity.type === "member"
                                ? "bg-chart-2"
                                : "bg-chart-3"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.type === "service"
                                ? "New service created"
                                : activity.type === "member"
                                ? "Member update"
                                : "Attendance recorded"}
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
                      <span>Contact Admin for details</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>Location Available in Members Area</p>
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
          </>
        )}

        {/* Attendance Tab Content */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
                <CardDescription>
                  Record and manage attendance for services and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className="justify-start">
                    <Link href="/attendance">
                      <Calendar className="w-4 h-4 mr-2" />
                      Record Attendance
                    </Link>
                  </Button>
                  {["admin", "cell_leader"].includes(user?.role) && (
                    <Button asChild className="justify-start">
                      <Link href="/members">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Members
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Tab Content */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
                <CardDescription>
                  Create and manage church services and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="justify-start">
                  <Link href="/services">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Services
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Finance Tab Content */}
        {canAccessFinance && activeTab === "finance" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Finance Management</CardTitle>
                <CardDescription>
                  Track partnerships, offerings, and financial reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="justify-start">
                  <Link href="/finance">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Finance
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
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
