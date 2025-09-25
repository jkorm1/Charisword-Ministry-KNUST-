import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function HomePage() {
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
                <h1 className="text-xl font-bold text-balance">Charisword Gospel Ministry</h1>
                <p className="text-sm text-muted-foreground">Church Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            Professional Church Management
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Manage Your Ministry with{" "}
            <span className="ministry-gradient bg-clip-text text-transparent">Excellence</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Streamline attendance tracking, financial management, and member engagement with our comprehensive church
            management platform designed for modern ministries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-balance">Powerful Features for Your Ministry</h3>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Everything you need to manage your church operations efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <CardTitle className="text-lg">Attendance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-pretty">
                  Efficiently record and manage member attendance with mobile-friendly interfaces for ushers at the
                  gate.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <CardTitle className="text-lg">Financial Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-pretty">
                  Track partnerships, offerings, and financial contributions with detailed reporting and analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <CardTitle className="text-lg">Service Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-pretty">
                  Organize services, track first-timers, and manage member lifecycle from visitors to full members.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <CardTitle className="text-lg">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-pretty">
                  Comprehensive dashboards and reports for attendance trends, financial insights, and growth metrics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-balance">Role-Based Access Control</h3>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Secure, role-specific interfaces designed for different ministry positions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">A</span>
              </div>
              <h4 className="font-semibold mb-2">Admin</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                Full system access, user management, and comprehensive reporting
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary">U</span>
              </div>
              <h4 className="font-semibold mb-2">Ushers</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                Gate attendance recording and first-timer registration
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="w-16 h-16 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-chart-3">C</span>
              </div>
              <h4 className="font-semibold mb-2">Cell Leaders</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                View and manage their assigned cell members and attendance
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="w-16 h-16 rounded-full bg-chart-4/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-chart-4">F</span>
              </div>
              <h4 className="font-semibold mb-2">Finance Leaders</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                Partnership and offering management with financial reporting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-balance">Connect With Us</h3>
            <p className="text-lg text-muted-foreground text-pretty">Get in touch with Charisword Gospel Ministry</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">📞</span>
                  <span>026 116 9859</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-1">📍</span>
                  <div>
                    <p>KNUST CAMPUS, REHABILITATION CENTER (CEDRES)</p>
                    <p className="text-sm text-muted-foreground">Digital Address: GT-337-6599</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">📘</span>
                  <span>Charisword Gospel Ministry</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-600">📷</span>
                  <span>@charisword</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">🐦</span>
                  <span>@ChariswordM</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg ministry-gradient flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <div>
                <p className="font-semibold">Charisword Gospel Ministry</p>
                <p className="text-sm text-muted-foreground">Church Management System</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">© 2025 Charisword Gospel Ministry. All rights reserved.</p>
              <p className="text-xs text-muted-foreground mt-1">Built with excellence for ministry management</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
