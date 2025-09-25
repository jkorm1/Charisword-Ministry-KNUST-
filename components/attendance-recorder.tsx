"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"

interface Member {
  member_id: number
  full_name: string
  gender: string
  membership_status: string
  cell_name: string
  fold_name: string
}

interface Service {
  service_id: number
  service_date: string
  service_type: string
  topic: string
}

export function AttendanceRecorder() {
  const [members, setMembers] = useState<Member[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [presentMembers, setPresentMembers] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

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

  const filteredMembers = members.filter((member) => member.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleMemberAttendance = (memberId: number) => {
    const newPresentMembers = new Set(presentMembers)
    if (newPresentMembers.has(memberId)) {
      newPresentMembers.delete(memberId)
    } else {
      newPresentMembers.add(memberId)
    }
    setPresentMembers(newPresentMembers)
  }

  const submitAttendance = async () => {
    if (!selectedService) return

    setLoading(true)
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService,
          present_member_ids: Array.from(presentMembers),
        }),
      })

      if (response.ok) {
        alert("Attendance recorded successfully!")
        setPresentMembers(new Set())
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error submitting attendance:", error)
      alert("Error submitting attendance")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Record Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Service</label>
            <select
              value={selectedService || ""}
              onChange={(e) => setSelectedService(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choose a service...</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_date} - {service.service_type} ({service.topic})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {presentMembers.size} of {filteredMembers.length} members marked present
            </p>
            <Button
              onClick={submitAttendance}
              disabled={!selectedService || loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 max-h-96 overflow-y-auto">
        {filteredMembers.map((member) => (
          <Card key={member.member_id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={presentMembers.has(member.member_id)}
                  onCheckedChange={() => toggleMemberAttendance(member.member_id)}
                />
                <div>
                  <p className="font-medium">{member.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {member.cell_name} • {member.fold_name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={member.gender === "Male" ? "default" : "secondary"}>{member.gender}</Badge>
                <Badge variant="outline">{member.membership_status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
