"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

interface Member {
  member_id: number
  full_name: string
}

interface Service {
  service_id: number
  service_date: string
  service_type: string
  topic: string
}

export function FirstTimerForm() {
  const [members, setMembers] = useState<Member[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    residence: "",
    phone: "",
    email: "",
    inviter_member_id: "",
    service_id: "",
    status: "Visit",
  })

  useEffect(() => {
    fetchMembers()
    fetchServices()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/first-timers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          inviter_member_id: formData.inviter_member_id || null,
        }),
      })

      if (response.ok) {
        alert("First-timer recorded successfully!")
        setFormData({
          full_name: "",
          gender: "",
          residence: "",
          phone: "",
          email: "",
          inviter_member_id: "",
          service_id: "",
          status: "Visit",
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error recording first-timer:", error)
      alert("Error recording first-timer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Record First-Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <Label htmlFor="residence">Residence</Label>
              <Input
                id="residence"
                value={formData.residence}
                onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="inviter">Inviter (Member)</Label>
              <select
                id="inviter"
                value={formData.inviter_member_id}
                onChange={(e) => setFormData({ ...formData, inviter_member_id: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select inviter...</option>
                {members.map((member) => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="service">Service *</Label>
              <select
                id="service"
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select service...</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.service_date} - {service.service_type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="Visit">Visit</option>
                <option value="Stay">Stay (Convert to Member)</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? "Recording..." : "Record First-Timer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
