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
  recorded_by: string;
}

export function FinanceReports() {
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [offeringReports, setOfferingReports] = useState<OfferingReport[]>([]);
  const [paymentReports, setPaymentReports] = useState<PaymentReport[]>([]); // Add this
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

  useEffect(() => {
    fetchCells();
    fetchReports();
    fetchOfferingReports();
    fetchPaymentReports();
  }, [selectedCell, dateFrom, dateTo]);

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

  const fetchPaymentReports = async () => {
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

      const response = await fetch(`/api/reports/payments?${params}`, {
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

      setPaymentReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Detailed error:", err);
    } finally {
      setLoading(false);
    }
  };

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
          {activeTab === "payments" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold">
                Total Payments: GHS{" "}
                {paymentReports
                  .reduce((sum, report) => sum + Number(report.amount || 0), 0)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount (GHS)</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentReports.map((report) => (
                  <TableRow key={report.payment_id}>
                    <TableCell>{formatDate(report.payment_date)}</TableCell>
                    <TableCell>{report.payment_type}</TableCell>
                    <TableCell>{report.description || "N/A"}</TableCell>
                    <TableCell>{report.amount.toLocaleString()}</TableCell>
                    <TableCell>{report.recorded_by || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
