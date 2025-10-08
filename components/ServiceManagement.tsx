"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string | null;
  created_by_user_id: number;
  created_at: string;
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState({
    service_date: "",
    service_type: "",
    topic: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.service_id.toString() === serviceId);
    if (service) {
      setSelectedService(serviceId);
      setFormData({
        service_date: new Date(service.service_date)
          .toISOString()
          .split("T")[0],
        service_type: service.service_type,
        topic: service.topic || "",
      });
    }
  };

  const handleSubmit = async (isUpdate: boolean) => {
    setIsLoading(true);
    try {
      const url = "/api/services";
      const method = isUpdate ? "PUT" : "POST";

      const formattedData = {
        ...formData,
        service_date: new Date(formData.service_date)
          .toISOString()
          .split("T")[0],
      };

      const body = isUpdate
        ? { ...formattedData, service_id: parseInt(selectedService) }
        : formattedData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Service ${
            isUpdate ? "updated" : "created"
          } successfully`,
        });
        fetchServices();
        if (!isUpdate) {
          setFormData({
            service_date: "",
            service_type: "",
            topic: "",
          });
        }
      } else {
        throw new Error("Failed to save service");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isUpdate ? "update" : "create"} service`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service-select">
              Select Existing Service (Optional)
            </Label>
            <Select value={selectedService} onValueChange={handleServiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service to edit" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem
                    key={service.service_id}
                    value={service.service_id.toString()}
                  >
                    {new Date(service.service_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}{" "}
                    - {service.service_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-date">Service Date</Label>
              <Input
                id="service-date"
                type="date"
                value={formData.service_date}
                onChange={(e) =>
                  handleInputChange("service_date", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) =>
                  handleInputChange("service_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supergathering">Supergathering</SelectItem>
                  <SelectItem value="Midweek">Midweek</SelectItem>
                  <SelectItem value="Special">Special Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                placeholder="Enter service topic"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={
                isLoading || !formData.service_date || !formData.service_type
              }
            >
              {isLoading ? "Creating..." : "Create New Service"}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={
                isLoading ||
                !selectedService ||
                !formData.service_date ||
                !formData.service_type
              }
              variant="outline"
            >
              {isLoading ? "Updating..." : "Update Selected Service"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.service_id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <p className="font-medium">
                    {new Date(service.service_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {service.service_type}
                  </p>
                  {service.topic && (
                    <p className="text-sm text-gray-500">{service.topic}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
