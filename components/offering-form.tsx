"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";

interface Service {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
}

interface Program {
  program_id: number;
  program_name: string;
  program_date: string;
}

interface OfferingReport {
  offering_id: number;
  amount: number;
  date_recorded: string;
  service_id: number;
}

interface ApiError {
  error: string;
  message?: string;
}

export function OfferingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_id: "",
    program_id: "",
    amount: "",
    date_recorded: new Date().toISOString().split("T")[0],
  });

  const [existingOffering, setExistingOffering] =
    useState<OfferingReport | null>(null);

  useEffect(() => {
    fetchServices();
    fetchPrograms();
  }, []);

  const fetchServices = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("auth-token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      const formattedServices = data.map((service) => ({
        ...service,
        formatted_date: new Date(service.service_date).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        ),
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch services"
      );
      setServices([]);
    }
  };

  // Add fetchPrograms function
  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/programs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
    }
  };

  const handleServiceChange = async (serviceId: string) => {
    setError(null);
    setFormData({
      ...formData,
      service_id: serviceId,
      program_id: "", // Clear program when service is selected
    });

    if (serviceId) {
      await checkExistingOffering(serviceId);
    }
  };

  const handleDateChange = async (date: string) => {
    setError(null);
    setFormData({
      ...formData,
      date_recorded: date,
    });
    // Remove the checkExistingOffering call
  };

  const checkExistingOffering = async (
    serviceId?: string,
    programId?: string
  ) => {
    try {
      if (!serviceId && !programId) return false;

      const params = new URLSearchParams();
      if (serviceId) params.append("serviceId", serviceId);
      if (programId) params.append("programId", programId);
      params.append("date", formData.date_recorded);

      const response = await fetch(`/api/offerings/check?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.offering) {
          setExistingOffering(data.offering);
          setFormData((prev) => ({
            ...prev,
            amount: data.offering.amount.toString(),
            date_recorded: data.offering.date_recorded,
          }));
          // Show immediate alert
          alert(
            `An existing offering was found for this ${
              serviceId ? "service" : "program"
            } on ${data.offering.date_recorded}. You can now update it.`
          );
          return true;
        }
      }
      setExistingOffering(null);
      return false;
    } catch (error) {
      console.error("Error checking existing offering:", error);
      setExistingOffering(null);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.service_id && !formData.program_id) {
      setError("Please select either a service or a program");
      return false;
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      setError("Please enter a valid amount");
      return false;
    }
    if (!formData.date_recorded) {
      setError("Please select a date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Always prevent default first
    setError(null);
    if (existingOffering) {
      handleUpdate(e);
    } else {
      e.preventDefault();
      setError(null);

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const isUpdate = existingOffering !== null;
        const response = await fetch("/api/offerings", {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({
            ...(isUpdate && { offering_id: existingOffering.offering_id }),
            service_id: Number.parseInt(formData.service_id),
            program_id: formData.program_id
              ? Number.parseInt(formData.program_id)
              : null,
            amount: Number.parseFloat(formData.amount),
            date_recorded: formData.date_recorded,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(
            isUpdate
              ? "Offering updated successfully!"
              : "Offering recorded successfully!"
          );
          setFormData({
            service_id: "",
            program_id: "",
            amount: "",
            date_recorded: new Date().toISOString().split("T")[0],
          });
          setExistingOffering(null);
        } else {
          const apiError = data as ApiError;
          throw new Error(apiError.error || "Failed to save offering");
        }
      } catch (error) {
        console.error("Error saving offering:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error saving offering";
        setError(errorMessage);
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleProgramChange = async (programId: string) => {
    setError(null);
    setFormData({
      ...formData,
      program_id: programId,
      service_id: "", // Clear service when program is selected
    });

    if (programId) {
      await checkExistingOffering(undefined, programId);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !existingOffering) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/offerings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          offering_id: existingOffering.offering_id,
          amount: Number.parseFloat(formData.amount),
          date_recorded: formData.date_recorded,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Offering updated successfully!");
        setFormData({
          service_id: "",
          amount: "",
          date_recorded: new Date().toISOString().split("T")[0],
        });
        setExistingOffering(null);
      } else {
        const apiError = data as ApiError;
        throw new Error(apiError.error || "Failed to update offering");
      }
    } catch (error) {
      console.error("Error updating offering:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error updating offering";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          {existingOffering
            ? `Update Offering - ${
                existingOffering.service_id ? "Service" : "Program"
              }`
            : "Record New Offering"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service">Service *</Label>
            <select
              id="service"
              value={formData.service_id}
              onChange={(e) => handleServiceChange(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                formData.program_id && !formData.service_id
                  ? "border-red-500"
                  : ""
              }`}
              disabled={!!formData.program_id} // Disable when program is selected
              required={!formData.program_id} // Required only when no program is selected
            >
              <option value="">Select service...</option>
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
              onChange={(e) => handleProgramChange(e.target.value)}
              className="w-full p-2 border rounded-md"
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
              onChange={(e) => {
                setError(null);
                setFormData({ ...formData, amount: e.target.value });
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="date_recorded">Date Recorded *</Label>
            <Input
              id="date_recorded"
              type="date"
              value={formData.date_recorded}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading
              ? "Saving..."
              : existingOffering
              ? "Update Offering"
              : "Record Offering"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
