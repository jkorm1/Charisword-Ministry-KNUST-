"use client";

import React from "react";
import { useState, useEffect } from "react";
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

interface PartnershipDetail {
  amount: number;
  date: string;
  partner_name: string;
}

interface Program {
  id: number;
  name: string;
  date: string;
  type: "program";
}

interface Service {
  id: number;
  type: string;
  name: string;
  date: string;
  topic?: string;
}

interface ReportsResponse {
  payments: PaymentReport[];
  summary: {
    totalOfferings: number;
    totalPartnerships: number;
    totalPayments: number;
    availableBalance: number;
    categoryTotals: Record<string, number>;
  };
  categories: string[];
  programs: Program[];
  services: Service[];
}

interface MemberReport {
  member_id: number;
  full_name: string;
  cell_name: string;
  total_partnerships: number;
  partnership_details: PartnershipDetail[];
  last_contribution_date: string;
}

interface OfferingReport {
  offering_id: number;
  amount: number;
  date_recorded: string;
  service_date: string;
  service_type: string;
  topic: string;
  recorded_by: string;
}

interface PaymentReport {
  payment_id: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  description: string;
  payment_category: string;
  reference_name: string;
  recorded_by: string;
}

interface PaymentSummary {
  totalOfferings: number;
  totalPartnerships: number;
  totalPayments: number;
  availableBalance: number;
  categoryTotals: Record<string, number>;
}

export function FinanceReports() {
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [offeringReports, setOfferingReports] = useState<OfferingReport[]>([]);
  const [paymentReports, setPaymentReports] = useState<PaymentReport[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [services, setServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedReferenceType, setSelectedReferenceType] =
    useState<string>("");
  const [cells, setCells] = useState([]);
  const [selectedCell, setSelectedCell] = useState<string | undefined>(
    undefined
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // Fix: Use an object to track expanded states instead of a Set
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<
    "partnerships" | "offerings" | "payments"
  >("partnerships");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format dates for API
  const formatDateForAPI = (date: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Date validation function
  const validateDates = () => {
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      if (fromDate > toDate) {
        setError("From date cannot be after to date");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const fetchCells = async () => {
    try {
      const response = await fetch("/api/cells");
      const data = await response.json();
      setCells(data);
    } catch (error) {
      console.error("Error fetching cells:", error);
    }
  };

  const fetchReports = async () => {
    if (!validateDates()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCell && selectedCell !== "all") {
        params.append("cellId", selectedCell);
      }
      if (dateFrom) params.append("from", formatDateForAPI(dateFrom));
      if (dateTo) params.append("to", formatDateForAPI(dateTo));

      const response = await fetch(`/api/reports/partnerships?${params}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferingReports = async () => {
    if (!validateDates()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("from", formatDateForAPI(dateFrom));
      if (dateTo) params.append("to", formatDateForAPI(dateTo));

      const token = localStorage.getItem("auth-token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/reports/offerings?${params}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      setOfferingReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Detailed error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fix: Updated toggleRow function to work with an object instead of a Set
  const toggleRow = (memberId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  // Update fetchPaymentReports function
  const fetchPaymentReports = async () => {
    if (!validateDates()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("from", formatDateForAPI(dateFrom));
      if (dateTo) params.append("to", formatDateForAPI(dateTo));
      if (selectedCategory) {
        // Remove the "all" check
        params.append("category", selectedCategory);
      }
      if (selectedService && selectedReferenceType) {
        params.append("serviceId", selectedService);
        params.append("referenceType", selectedReferenceType);
      }

      const response = await fetch(
        `/api/reports/payments?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch payment reports");

      const data = await response.json();
      setPaymentReports(data.payments || []);
      setPaymentSummary(data.summary);
      setCategories(data.categories || []);
      setPrograms(data.programs || []);
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Detailed error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/reports/payments/filters", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch filter options");
      }
      const data = await response.json();
      setCategories(data.categories || []); // This should be fetching categories
      setServiceTypes(data.serviceTypes || []);
      setServices((data.services || []) as Service[]);
      setPrograms((data.programs || []) as Program[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch filter options"
      );
    } finally {
      setLoadingFilters(false);
    }
  };

  const handleServiceProgramChange = (value: string) => {
    if (value === "all") {
      // Reset both selections
      setSelectedService("");
      setSelectedReferenceType("");
    } else if (value === "service:all") {
      // Select all services
      setSelectedService("all");
      setSelectedReferenceType("service");
    } else if (value === "program:all") {
      // Select all programs
      setSelectedService("all");
      setSelectedReferenceType("program");
    } else {
      // Handle specific service/program selection
      const [type, id] = value.split(":");
      setSelectedService(id);
      setSelectedReferenceType(type);
    }
  };

  useEffect(() => {
    fetchCells();
    fetchReports();
    fetchOfferingReports();
    fetchPaymentReports();
    if (activeTab === "payments") {
      fetchFilterOptions();
    }
  }, [
    selectedCell,
    dateFrom,
    dateTo,
    activeTab,
    selectedCategory,
    selectedService, // Changed from selectedProgram
    selectedReferenceType, // Added this dependency
  ]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cell">Select cell</Label>
            <Select
              value={selectedCell || "all"}
              onValueChange={(value) =>
                setSelectedCell(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All cells" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cells</SelectItem>
                {cells.map((cell: any) => (
                  <SelectItem key={cell.cell_id} value={cell.cell_id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Payment Category</Label>
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) =>
                setSelectedCategory(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {loadingFilters ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : (
                  categories?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  )) || []
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service">Service/Program</Label>
            <Select
              value={
                selectedReferenceType
                  ? `${selectedReferenceType}:${selectedService}`
                  : "all"
              }
              onValueChange={handleServiceProgramChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All services and programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services and programs</SelectItem>
                <SelectItem value="service:all">All Services</SelectItem>
                <SelectItem value="program:all">All Programs</SelectItem>
                {services.map((service: Service) => (
                  <SelectItem
                    key={`service:${service.id}`}
                    value={`service:${service.id}`}
                  >
                    {service.name} -{" "}
                    {new Date(service.date).toLocaleDateString()}
                  </SelectItem>
                ))}
                {programs.map((program: Program) => (
                  <SelectItem
                    key={`program:${program.id}`}
                    value={`program:${program.id}`}
                  >
                    {program.name} -{" "}
                    {new Date(program.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Card>
        <CardHeader>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "partnerships" ? "default" : "outline"}
              onClick={() => setActiveTab("partnerships")}
            >
              Partnership Reports
            </Button>
            <Button
              variant={activeTab === "offerings" ? "default" : "outline"}
              onClick={() => setActiveTab("offerings")}
            >
              Offering Reports
            </Button>
            <Button
              variant={activeTab === "payments" ? "default" : "outline"}
              onClick={() => setActiveTab("payments")}
            >
              Payment Reports
            </Button>
          </div>
          {activeTab === "partnerships" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold">
                Total Partnerships: GHS{" "}
                {reports
                  .reduce(
                    (sum, report) =>
                      sum + Number(report.total_partnerships || 0),
                    0
                  )
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </p>
            </div>
          )}
          {activeTab === "offerings" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold">
                Total Offerings: GHS{" "}
                {offeringReports
                  .reduce((sum, report) => sum + Number(report.amount || 0), 0)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </p>
            </div>
          )}

          {activeTab === "payments" && paymentSummary && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Offerings</p>
                  <p className="text-lg font-semibold">
                    GHS{" "}
                    {paymentSummary.totalOfferings
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Partnerships</p>
                  <p className="text-lg font-semibold">
                    GHS{" "}
                    {paymentSummary.totalPartnerships
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-lg font-semibold">
                    GHS{" "}
                    {paymentSummary.totalPayments
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p
                    className={`text-lg font-semibold ${
                      paymentSummary.availableBalance < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    GHS{" "}
                    {paymentSummary.availableBalance
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Expenses by Category</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(paymentSummary.categoryTotals).map(
                    ([category, total]) => (
                      <div key={category} className="flex gap-2">
                        <span className="text-sm">{category}:</span>
                        <span className="text-sm font-medium">
                          GHS{" "}
                          {total
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-4">Loading reports...</p>}
          {error && <p className="text-red-500 text-center py-4">{error}</p>}

          {activeTab === "partnerships" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Cell</TableHead>
                  <TableHead>Total Partnerships</TableHead>
                  <TableHead>Number of Contributions</TableHead>
                  <TableHead>Last Contribution Date</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, index) => (
                  <React.Fragment key={report.member_id}>
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{report.full_name}</TableCell>
                      <TableCell>{report.cell_name || "N/A"}</TableCell>
                      <TableCell>
                        GHS {report.total_partnerships?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {report.partnership_details?.length || 0}
                      </TableCell>
                      <TableCell>
                        {formatDate(report.last_contribution_date)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => toggleRow(report.member_id)}
                        >
                          {expandedRows[report.member_id] ? "▲" : "▼"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {/* Fix: Updated condition to check the object property */}
                    {expandedRows[report.member_id] && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="p-4 bg-gray-50">
                            <h4 className="font-semibold mb-2">
                              Partnership Details
                            </h4>
                            {report.partnership_details?.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Partner Name</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {report.partnership_details.map(
                                    (detail, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          GHS {detail.amount}
                                        </TableCell>
                                        <TableCell>
                                          {formatDate(detail.date)}
                                        </TableCell>
                                        <TableCell>
                                          {detail.partner_name || "N/A"}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            ) : (
                              <p>No partnership records found</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          ) : (
            ""
          )}

          {/* Offering Table */}
          {activeTab === "offerings" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Recorded</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Amount (GHS)</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offeringReports.map((report) => (
                  <TableRow key={report.offering_id}>
                    <TableCell>{formatDate(report.date_recorded)}</TableCell>
                    <TableCell>{formatDate(report.service_date)}</TableCell>
                    <TableCell>{report.service_type}</TableCell>
                    <TableCell>{report.topic}</TableCell>
                    <TableCell>{report.amount.toLocaleString()}</TableCell>
                    <TableCell>{report.recorded_by || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Payments Table */}
          {activeTab === "payments" && (
            // Update the payments table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Service/Program</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount (GHS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentReports?.map((report) => (
                  <TableRow key={report.payment_id}>
                    <TableCell>{formatDate(report.payment_date)}</TableCell>
                    <TableCell>{report.payment_category}</TableCell>
                    <TableCell>{report.reference_name}</TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>{report.amount.toLocaleString()}</TableCell>
                  </TableRow>
                )) || []}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
