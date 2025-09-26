"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Member {
  member_id: number;
  full_name: string;
}

interface Service {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
}

interface FirstTimer {
  full_name: string;
  gender: string;
  residence: string;
  phone: string;
  email: string;
  inviter_member_id: string;
  service_id: string;
  status: string;
}

export function FirstTimerForm() {
  const [members, setMembers] = useState<Member[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([
    {
      full_name: "",
      gender: "",
      residence: "",
      phone: "",
      email: "",
      inviter_member_id: "",
      service_id: "",
      status: "Visit",
    },
  ]);

  useEffect(() => {
    fetchMembers();
    fetchServices();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const addFirstTimer = () => {
    setFirstTimers([
      ...firstTimers,
      {
        full_name: "",
        gender: "",
        residence: "",
        phone: "",
        email: "",
        inviter_member_id: "",
        service_id: "",
        status: "Visit",
      },
    ]);
  };

  const removeFirstTimer = (index: number) => {
    if (firstTimers.length > 1) {
      setFirstTimers(firstTimers.filter((_, i) => i !== index));
    }
  };

  const updateFirstTimer = (
    index: number,
    field: keyof FirstTimer,
    value: string
  ) => {
    const updated = [...firstTimers];
    updated[index][field] = value;
    setFirstTimers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/first-timers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: firstTimers[0].service_id,
          first_timers: firstTimers.map((ft) => ({
            ...ft,
            inviter_member_id: ft.inviter_member_id || null,
          })),
        }),
      });

      if (response.ok) {
        alert("First-timers recorded successfully!");
        setFirstTimers([
          {
            full_name: "",
            gender: "",
            residence: "",
            phone: "",
            email: "",
            inviter_member_id: "",
            service_id: "",
            status: "Visit",
          },
        ]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error recording first-timers:", error);
      alert("Error recording first-timers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Record First-Timers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {firstTimers.map((firstTimer, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">First-Timer #{index + 1}</h3>
                {firstTimers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFirstTimer(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={firstTimer.full_name}
                    onChange={(e) =>
                      updateFirstTimer(index, "full_name", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Gender *</Label>
                  <select
                    value={firstTimer.gender}
                    onChange={(e) =>
                      updateFirstTimer(index, "gender", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <Label>Residence</Label>
                  <Input
                    value={firstTimer.residence}
                    onChange={(e) =>
                      updateFirstTimer(index, "residence", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={firstTimer.phone}
                    onChange={(e) =>
                      updateFirstTimer(index, "phone", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={firstTimer.email}
                    onChange={(e) =>
                      updateFirstTimer(index, "email", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Inviter (Member)</Label>
                  <select
                    value={firstTimer.inviter_member_id}
                    onChange={(e) =>
                      updateFirstTimer(
                        index,
                        "inviter_member_id",
                        e.target.value
                      )
                    }
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
                  <Label>Service *</Label>
                  <select
                    value={firstTimer.service_id}
                    onChange={(e) =>
                      updateFirstTimer(index, "service_id", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select service...</option>
                    {services.map((service) => (
                      <option
                        key={service.service_id}
                        value={service.service_id}
                      >
                        {service.service_date} - {service.service_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Status *</Label>
                  <select
                    value={firstTimer.status}
                    onChange={(e) =>
                      updateFirstTimer(index, "status", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Visit">Visit</option>
                    <option value="Stay">Stay (Convert to Member)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={addFirstTimer}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another First-Timer
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Recording..." : "Record All First-Timers"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
