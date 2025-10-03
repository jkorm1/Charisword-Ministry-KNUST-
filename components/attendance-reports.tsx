// components/attendance-reports.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download, Filter } from "lucide-react";

interface AttendanceReport {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
  total_present: number;
  total_absent: number;
  first_timers: number;
  associates: number;
  members: number;
}

interface Service {
  service_id: number;
  service_type: string;
  date: string;
}

interface Cell {
  cell_id: number;
  name: string;
}

interface AttendanceReportsProps {
  userRole: string;
  assignedCellId?: number;
}

export function AttendanceReports({
  userRole,
  assignedCellId,
}: AttendanceReportsProps) {
  // Fixed: Proper type annotations
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);

  // Fixed: Use undefined instead of "undefined" string
  const [filters, setFilters] = useState({
    serviceId: undefined as number | undefined,
    fromDate: "",
    toDate: "",
    cellId: undefined as number | undefined,
  });

  // Fixed: Add filters as dependency
  useEffect(() => {
    fetchServices();
    fetchCells();
    fetchReports();
  }, [filters]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchCells = async () => {
    try {
      const response = await fetch("/api/cells");
      if (response.ok) {
        const data = await response.json();
        setCells(data);
      }
    } catch (error) {
      console.error("Error fetching cells:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.serviceId)
        params.append("serviceId", filters.serviceId.toString());
      if (filters.fromDate) params.append("from", filters.fromDate);
      if (filters.toDate) params.append("to", filters.toDate);

      // Cell leaders can only see reports for their assigned cell
      if (userRole === "cell_leader" && assignedCellId) {
        params.append("cellId", assignedCellId.toString());
      } else if (filters.cellId) {
        params.append("cellId", filters.cellId.toString());
      }

      const response = await fetch(`/api/reports/attendance?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    fetchReports();
  };

  // Fixed: Use undefined instead of "undefined" string
  const handleResetFilters = () => {
    setFilters({
      serviceId: undefined,
      fromDate: "",
      toDate: "",
      cellId: undefined,
    });
    fetchReports();
  };

  const exportReport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.serviceId)
        params.append("serviceId", filters.serviceId.toString());
      if (filters.fromDate) params.append("from", filters.fromDate);
      if (filters.toDate) params.append("to", filters.toDate);

      if (userRole === "cell_leader" && assignedCellId) {
        params.append("cellId", assignedCellId.toString());
      } else if (filters.cellId) {
        params.append("cellId", filters.cellId.toString());
      }

      window.open(`/api/reports/attendance/export?${params}`, "_blank");
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
          <CardDescription>
            View and export attendance reports for services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="service">Service</Label>
              <Select
                value={filters.serviceId?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange("serviceId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem
                      key={service.service_id}
                      value={service.service_id.toString() || "all"}
                    >
                      {service.service_type} -{" "}
                      {new Date(service.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </div>

            {(userRole === "admin" || userRole === "usher") && (
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="cell">Cell</Label>
                <Select
                  value={filters.cellId?.toString() || "all"}
                  onValueChange={(value) => handleFilterChange("cellId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cell" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cells</SelectItem>
                    {cells.map((cell) => (
                      <SelectItem
                        key={cell.cell_id}
                        value={cell.cell_id.toString() || "all"}
                      >
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={exportReport} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Total Present</TableHead>
                  <TableHead>Total Absent</TableHead>
                  <TableHead>First Timers</TableHead>
                  <TableHead>Associates</TableHead>
                  <TableHead>Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.service_id}>
                      <TableCell>{report.service_type}</TableCell>
                      <TableCell>
                        {new Date(report.service_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{report.topic}</TableCell>
                      <TableCell>{report.total_present}</TableCell>
                      <TableCell>{report.total_absent}</TableCell>
                      <TableCell>{report.first_timers}</TableCell>
                      <TableCell>{report.associates}</TableCell>
                      <TableCell>{report.members}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No attendance records found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
