// components/attendance-recorder.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Users, Info } from "lucide-react";

interface Member {
  member_id: number;
  full_name: string;
  gender: string;
  membership_status: string;
  cell_name: string;
  fold_name: string;
}

interface Service {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
}

interface AttendanceRecord {
  attendance_id: number;
  status: string;
  member_id: number;
}

export function AttendanceRecorder() {
  const [members, setMembers] = useState<Member[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [presentMembers, setPresentMembers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchServices();
  }, []);

  // New effect to fetch attendance when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchExistingAttendance(selectedService);
    } else {
      setPresentMembers(new Set());
      setHasExistingAttendance(false);
    }
  }, [selectedService]);

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

  // New function to fetch existing attendance
  const fetchExistingAttendance = async (serviceId: number) => {
    try {
      const response = await fetch(`/api/attendance?serviceId=${serviceId}`);
      if (response.ok) {
        const data: AttendanceRecord[] = await response.json();
        const presentIds = new Set(
          data
            .filter((record) => record.status === "Present")
            .map((record) => record.member_id)
        );
        setPresentMembers(presentIds);
        setHasExistingAttendance(data.length > 0);
      }
    } catch (error) {
      console.error("Error fetching existing attendance:", error);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMemberAttendance = (memberId: number) => {
    const newPresentMembers = new Set(presentMembers);
    if (newPresentMembers.has(memberId)) {
      newPresentMembers.delete(memberId);
    } else {
      newPresentMembers.add(memberId);
    }
    setPresentMembers(newPresentMembers);
  };

  const submitAttendance = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService,
          present_member_ids: Array.from(presentMembers),
        }),
      });

      if (response.ok) {
        alert(
          hasExistingAttendance
            ? "Attendance updated successfully!"
            : "Attendance recorded successfully!"
        );
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Error submitting attendance");
    } finally {
      setLoading(false);
    }
  };

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
            <label className="text-sm font-medium">Select Service</label>
            <select
              value={selectedService || ""}
              onChange={(e) => setSelectedService(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choose a service...</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_date} - {service.service_type} (
                  {service.topic})
                </option>
              ))}
            </select>
          </div>

          {hasExistingAttendance && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This service already has attendance recorded. You can update the
                attendance by modifying the selections below.
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {presentMembers.size} of {filteredMembers.length} members marked
              present
            </p>
            <Button
              onClick={submitAttendance}
              disabled={loading || !selectedService}
            >
              {loading
                ? "Submitting..."
                : hasExistingAttendance
                ? "Update Attendance"
                : "Submit Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <div
            key={member.member_id}
            className="flex items-center space-x-3 p-3 border rounded-lg"
          >
            <Checkbox
              checked={presentMembers.has(member.member_id)}
              onCheckedChange={() => toggleMemberAttendance(member.member_id)}
            />
            <div className="flex-1">
              <p className="font-medium">{member.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {member.cell_name} • {member.fold_name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{member.gender}</Badge>
              <Badge>{member.membership_status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
