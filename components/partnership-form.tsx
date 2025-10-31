// components/partnership-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface Member {
  member_id: number;
  full_name: string;
}

interface Service {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
  formatted_date?: string;
}

interface Program {
  program_id: number;
  program_name: string;
  program_date: string;
}

export function PartnershipForm() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partner_name: "",
    member_id: null as number | null,
    amount: "",
    date_given: new Date().toISOString().split("T")[0],
    service_id: "",
    program_id: "",
  });

  useEffect(() => {
    fetchMembers();
    fetchServices();
    fetchPrograms();
  }, []);

  const fetchMembers = async () => {
    try {
      setFetchError(null);
      const token = localStorage.getItem("auth-token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/partnerships", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const uniqueMembers = Array.from(
        new Map(
          data.map((item: any) => [
            item.member_id,
            {
              member_id: item.member_id,
              full_name: item.full_name,
            },
          ])
        ).values()
      );
      setMembers(uniqueMembers);
    } catch (error) {
      console.error("Error fetching partnership data:", error);
      setFetchError("Failed to fetch partnership data");
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const formattedServices = data.map((service: Service) => ({
        ...service,
        formatted_date: new Date(service.service_date).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        ),
      }));
      setServices(formattedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/programs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
    }
  };

  const handleNameSearch = (searchTerm: string) => {
    setFormData({ ...formData, partner_name: searchTerm, member_id: null });
    setIsSearching(true);

    if (searchTerm.trim().length > 0) {
      const filtered = members.filter(
        (member) =>
          member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          searchTerm.toLowerCase().includes(member.full_name.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers([]);
    }
    setIsSearching(false);
  };

  const selectMember = (member: Member) => {
    setFormData({
      ...formData,
      partner_name: member.full_name,
      member_id: member.member_id,
    });
    setFilteredMembers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: formData.member_id,
          partner_name: formData.partner_name,
          amount: Number.parseFloat(formData.amount),
          date_given: formData.date_given,
          service_id: formData.service_id || null,
          program_id: formData.program_id || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Partnership recorded successfully!");
        setFormData({
          partner_name: "",
          member_id: null,
          amount: "",
          date_given: new Date().toISOString().split("T")[0],
          service_id: "",
          program_id: "",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to record partnership");
      }
    } catch (error) {
      console.error("Error recording partnership:", error);
      alert("Error recording partnership");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="relative">
            <Label htmlFor="partner_name">Partner Name *</Label>
            <Input
              id="partner_name"
              value={formData.partner_name}
              onChange={(e) => handleNameSearch(e.target.value)}
              placeholder="Start typing to search members or enter new name"
              required
            />
            {fetchError && (
              <div className="text-red-500 text-sm mt-1">{fetchError}</div>
            )}
            {filteredMembers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                {filteredMembers.map((member) => (
                  <div
                    key={member.member_id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectMember(member)}
                  >
                    {member.full_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="service">Service</Label>
            <select
              id="service"
              value={formData.service_id}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  service_id: e.target.value,
                  program_id: "", // Clear program when service is selected
                });
              }}
              className={`w-full p-2 border rounded-md ${
                formData.program_id ? "border-gray-300 bg-gray-100" : ""
              }`}
              disabled={!!formData.program_id}
            >
              <option value="">No service</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.formatted_date} - {service.service_type} (
                  {service.topic})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="program">Program</Label>
            <select
              id="program"
              value={formData.program_id}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  program_id: e.target.value,
                  service_id: "", // Clear service when program is selected
                });
              }}
              className={`w-full p-2 border rounded-md ${
                formData.service_id ? "border-gray-300 bg-gray-100" : ""
              }`}
              disabled={!!formData.service_id}
            >
              <option value="">No program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name} -{" "}
                  {new Date(program.program_date).toLocaleDateString()}
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
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="date_given">Date Given *</Label>
            <Input
              id="date_given"
              type="date"
              value={formData.date_given}
              onChange={(e) =>
                setFormData({ ...formData, date_given: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Recording..." : "Record Partnership"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
