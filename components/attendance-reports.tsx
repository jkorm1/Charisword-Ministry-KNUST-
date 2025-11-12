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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import DetailedAttendanceReport from "./detailed-attendance-report";

interface AttendanceReport {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
  expected_members: number;
  present_members: number;
  absent_members: number;
  expected_associates: number;
  present_associates: number;
  absent_associates: number;
  first_timers: number;
  total_present: number;
  total_absent: number;
}

interface Service {
  service_id: number;
  service_type: string;
  service_date: string;
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
      const response = await fetch("/api/reports/attendance");
      if (response.ok) {
        const data = await response.json();
        // Only process services that have attendance data
        const servicesWithData = data.filter(
          (service) => service.has_attendance
        );

        const formattedServices = servicesWithData.map((service) => ({
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
                      {new Date(service.formatted_date).toLocaleDateString()}
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
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary Report</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
          </TabsList>

          {/* --- Summary Report Tab --- */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>

                        {/* Members Column */}
                        <th
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          colSpan={3}
                        >
                          Members
                        </th>

                        {/* Associates Column */}
                        <th
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          colSpan={3}
                        >
                          Associates
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          First Timers
                        </th>

                        {/* Overall Column */}
                        <th
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          colSpan={2}
                        >
                          Overall
                        </th>
                      </tr>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>

                        {/* Members Subheaders */}
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Membership
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>

                        {/* Associates Subheaders */}
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Associates
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Count
                        </th>

                        {/* Overall Subheaders */}
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.length > 0 ? (
                        reports.map((report) => (
                          <tr key={report.service_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                report.service_date
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {report.service_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {report.topic}
                            </td>

                            {/* Members Data */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {report.expected_members}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                              {report.present_members}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                              {report.absent_members}
                            </td>

                            {/* Associates Data */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {report.expected_associates}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                              {report.present_associates}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                              {report.absent_associates}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600">
                              {report.first_timers}
                            </td>

                            {/* Overall Data */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                              {report.total_present}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                              {report.total_absent}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={14} className="text-center py-8">
                            No attendance records found matching your criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Detailed Report Tab --- */}
          <TabsContent value="detailed" className="space-y-4">
            <DetailedAttendanceReport services={services} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
