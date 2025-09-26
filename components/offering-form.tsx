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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_id: "",
    amount: "",
    date_recorded: new Date().toISOString().split("T")[0],
  });
  const [existingOffering, setExistingOffering] =
    useState<OfferingReport | null>(null);

  useEffect(() => {
    fetchServices();
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

      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch services"
      );
      setServices([]);
    }
  };

  const checkExistingOffering = async (serviceId: string, date: string) => {
    try {
      const response = await fetch(
        `/api/offerings/check?serviceId=${serviceId}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setExistingOffering(data.offering);
          setError(
            `An offering for this service already exists on ${date}. Please update the existing record.`
          );
          return true;
        }
      }
      setExistingOffering(null);
      return false;
    } catch (error) {
      console.error("Error checking existing offering:", error);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.service_id) {
      setError("Please select a service");
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
    if (existingOffering) {
      handleUpdate(e);
    } else {
      // Existing code for creating a new offering
      e.preventDefault();
      setError(null);

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/offerings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({
            service_id: Number.parseInt(formData.service_id),
            amount: Number.parseFloat(formData.amount),
            date_recorded: formData.date_recorded,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Offering recorded successfully!");
          setFormData({
            service_id: "",
            amount: "",
            date_recorded: new Date().toISOString().split("T")[0],
          });
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
          service_id: Number.parseInt(formData.service_id),
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
          {existingOffering ? "Update Offering" : "Record Offering"}
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
              onChange={(e) => {
                setError(null);
                setFormData({ ...formData, service_id: e.target.value });
              }}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select service...</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_date} - {service.service_type} (
                  {service.topic})
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
              onChange={(e) => {
                setError(null);
                setFormData({ ...formData, date_recorded: e.target.value });
              }}
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
