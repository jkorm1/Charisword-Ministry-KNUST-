"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Coins } from "lucide-react"

interface Service {
  service_id: number
  service_date: string
  service_type: string
  topic: string
}

export function OfferingForm() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    service_id: "",
    amount: "",
    date_recorded: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchServices()
  }, [])

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
      const response = await fetch("/api/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: Number.parseInt(formData.service_id),
          amount: Number.parseFloat(formData.amount),
          date_recorded: formData.date_recorded,
        }),
      })

      if (response.ok) {
        alert("Offering recorded successfully!")
        setFormData({
          service_id: "",
          amount: "",
          date_recorded: new Date().toISOString().split("T")[0],
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error recording offering:", error)
      alert("Error recording offering")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Record Offering
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {service.service_date} - {service.service_type} ({service.topic})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (GHS) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_recorded">Date Recorded *</Label>
            <Input
              id="date_recorded"
              type="date"
              value={formData.date_recorded}
              onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? "Recording..." : "Record Offering"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
