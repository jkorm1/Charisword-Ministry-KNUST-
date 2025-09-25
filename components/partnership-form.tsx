"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

interface Member {
  member_id: number
  full_name: string
}

export function PartnershipForm() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    member_id: "",
    partner_name: "",
    amount: "",
    date_given: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members")
      const data = await response.json()
      setMembers(data.filter((m: any) => m.membership_status === "Member"))
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: formData.member_id || null,
          partner_name: formData.partner_name,
          amount: Number.parseFloat(formData.amount),
          date_given: formData.date_given,
        }),
      })

      if (response.ok) {
        alert("Partnership recorded successfully!")
        setFormData({
          member_id: "",
          partner_name: "",
          amount: "",
          date_given: new Date().toISOString().split("T")[0],
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error recording partnership:", error)
      alert("Error recording partnership")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Record Partnership
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="member">Member (Optional)</Label>
            <select
              id="member"
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select member or leave blank for external partner...</option>
              {members.map((member) => (
                <option key={member.member_id} value={member.member_id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="partner_name">Partner Name *</Label>
            <Input
              id="partner_name"
              value={formData.partner_name}
              onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
              placeholder="Enter partner name"
              required
            />
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
            <Label htmlFor="date_given">Date Given *</Label>
            <Input
              id="date_given"
              type="date"
              value={formData.date_given}
              onChange={(e) => setFormData({ ...formData, date_given: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? "Recording..." : "Record Partnership"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
