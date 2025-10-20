// components/payment-reports.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentReport {
  payment_id: number;
  amount: number;
  payment_type: string;
  payment_category: string;
  description: string;
  reference_name?: string;
  reference_date?: string;
  recorded_by: string;
  created_at: string;
}

export function PaymentReports() {
  const [reports, setReports] = useState<PaymentReport[]>([]);
  const [services, setServices] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState<"service" | "program" | "regular">(
    "service"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
    fetchPrograms();
    fetchReports();
  }, [activeTab, selectedService, selectedProgram, dateFrom, dateTo]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("category", activeTab);

      if (activeTab === "service" && selectedService) {
        params.append("referenceId", selectedService);
        params.append("referenceType", "service");
      }

      if (activeTab === "program" && selectedProgram) {
        params.append("referenceId", selectedProgram);
        params.append("referenceType", "program");
      }

      if (dateFrom) params.append("from", dateFrom);
      if (dateTo) params.append("to", dateTo);

      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/payments?${params}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const totalAmount = reports.reduce(
    (sum, report) => sum + Number(report.amount),
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="service">Service Payments</TabsTrigger>
              <TabsTrigger value="program">Program Payments</TabsTrigger>
              <TabsTrigger value="regular">Regular Payments</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTab === "service" && (
                  <div>
                    <Label htmlFor="service">Select Service</Label>
                    <Select
                      value={selectedService}
                      onValueChange={setSelectedService}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service: any) => (
                          <SelectItem
                            key={service.service_id}
                            value={service.service_id}
                          >
                            {formatDate(service.service_date)} -{" "}
                            {service.service_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeTab === "program" && (
                  <div>
                    <Label htmlFor="program">Select Program</Label>
                    <Select
                      value={selectedProgram}
                      onValueChange={setSelectedProgram}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program: any) => (
                          <SelectItem
                            key={program.program_id}
                            value={program.program_id}
                          >
                            {program.program_name} -{" "}
                            {formatDate(program.program_date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="from">From date</Label>
                  <Input
                    id="from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="to">To date</Label>
                  <Input
                    id="to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold">
                  Total Amount: GHS{" "}
                  {totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading && <p className="text-center py-4">Loading reports...</p>}
          {error && <p className="text-red-500 text-center py-4">{error}</p>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                {activeTab !== "regular" && <TableHead>Reference</TableHead>}
                <TableHead>Amount (GHS)</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.payment_id}>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                  <TableCell>{report.payment_type}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  {activeTab !== "regular" && (
                    <TableCell>
                      {report.reference_name && (
                        <div>
                          <div>{report.reference_name}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(report.reference_date)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{report.amount.toLocaleString()}</TableCell>
                  <TableCell>{report.recorded_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
