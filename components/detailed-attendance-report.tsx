// components/detailed-attendance-report.tsx
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Member {
  member_id: number;
  full_name: string;
  gender: string;
  phone: string;
  email: string;
  membership_status: string;
  cell_name: string;
  attendance_status: string;
  member_status_at_time: string;
}

interface Service {
  service_id: number;
  service_date: string;
  service_type: string;
  topic: string;
}

interface Summary {
  members: { present: number; absent: number };
  associates: { present: number; absent: number };
  firstTimers: { present: number; absent: number };
}

interface OrganizationInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
}

export default function DetailedAttendanceReport({
  services,
}: {
  services: Service[];
}) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<OrganizationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (selectedServiceId) {
      fetchDetailedReport();
    }
  }, [selectedServiceId]);

  const fetchDetailedReport = async () => {
    if (!selectedServiceId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports/attendance/details?serviceId=${selectedServiceId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
        setService(data.service);
        setSummary(data.summary);
        setOrganizationInfo(data.organizationInfo);
      }
    } catch (error) {
      console.error("Error fetching detailed report:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!selectedServiceId) return;

    setDownloading(true);
    try {
      const response = await fetch(
        `/api/reports/attendance/details?serviceId=${selectedServiceId}`
      );
      if (response.ok) {
        const data = await response.json();

        // Create a new window for printing
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        // Generate HTML content for the report
        const htmlContent = generatePrintableReport(data);

        // Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Print after a short delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          setDownloading(false);
        }, 500);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      setDownloading(false);
    }
  };

  const generatePrintableReport = (data: any) => {
    const { service, members, summary, organizationInfo } = data;
    const date = new Date(service.service_date);
    const formattedDate = date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "-");

    // Group members by status and attendance
    const membersPresent = members.filter(
      (m: Member) =>
        m.member_status_at_time === "Member" &&
        m.attendance_status === "Present"
    );
    const membersAbsent = members.filter(
      (m: Member) =>
        m.member_status_at_time === "Member" && m.attendance_status === "Absent"
    );
    const associatesPresent = members.filter(
      (m: Member) =>
        m.member_status_at_time === "Associate" &&
        m.attendance_status === "Present"
    );
    const associatesAbsent = members.filter(
      (m: Member) =>
        m.member_status_at_time === "Associate" &&
        m.attendance_status === "Absent"
    );
    const firstTimersPresent = members.filter(
      (m: Member) =>
        m.member_status_at_time === "FirstTimer" &&
        m.attendance_status === "Present"
    );

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .organization-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .phone {
            font-size: 0.9em;
            color: #555;
            margin-top: 2px;
        }
        .report-date {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .summary-box {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
          width: 30%;
          text-align: center;
        }
        .summary-box h3 {
          margin-top: 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .member-list {
          column-count: 3;
          column-gap: 20px;
        }
        .member-item {
          margin-bottom: 5px;
          break-inside: avoid;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="organization-name">${
          organizationInfo.name || "CHARISWORD CAMPUS MINISTRY"
        }</div>
        <div class="report-title">ATTENDANCE REPORT ${service.service_type.toUpperCase()}</div>
        <div class="report-date">${formattedDate}</div>
      </div>
      
      <div class="summary">
        <div class="summary-box">
          <h3>MEMBERS</h3>
          <div class="summary-row">
            <span>Total Membership:</span>
            <span>${summary.members.present + summary.members.absent}</span>
          </div>
          <div class="summary-row">
            <span>Present:</span>
            <span>${summary.members.present}</span>
          </div>
          <div class="summary-row">
            <span>Absent:</span>
            <span>${summary.members.absent}</span>
          </div>
        </div>
        
        <div class="summary-box">
          <h3>ASSOCIATES</h3>
          <div class="summary-row">
            <span>Total Associates:</span>
            <span>${
              summary.associates.present + summary.associates.absent
            }</span>
          </div>
          <div class="summary-row">
            <span>Present:</span>
            <span>${summary.associates.present}</span>
          </div>
          <div class="summary-row">
            <span>Absent:</span>
            <span>${summary.associates.absent}</span>
          </div>
        </div>
        
        <div class="summary-box">
          <h3>FIRST TIMERS</h3>
          <div class="summary-row">
            <span>Present:</span>
            <span>${summary.firstTimers.present}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">MEMBERS PRESENT (${
          membersPresent.length
        })</div>
        <div class="member-list">
          ${membersPresent
            .map((m: Member) => `<div class="member-item">${m.full_name}</div>`)
            .join("")}
        </div>
      </div>
      
        ${
          firstTimersPresent.length > 0
            ? `
        <div class="section">
        <div class="section-title">FIRST TIMERS (${
          firstTimersPresent.length
        })</div>
        <div class="member-list">
            ${firstTimersPresent
              .map(
                (m: Member) => `
                <div class="member-item">
                <div>${m.full_name}</div>
                ${m.phone ? `<div class="phone">${m.phone}</div>` : ""}
                </div>`
              )
              .join("")}
        </div>
        </div>
        `
            : ""
        }

      
      <div class="section">
        <div class="section-title">ASSOCIATES PRESENT (${
          associatesPresent.length
        })</div>
        <div class="member-list">
          ${associatesPresent
            .map((m: Member) => `<div class="member-item">${m.full_name}</div>`)
            .join("")}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">MEMBERS ABSENT (${
          membersAbsent.length
        })</div>
        <div class="member-list">
          ${membersAbsent
            .map((m: Member) => `<div class="member-item">${m.full_name}</div>`)
            .join("")}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">ASSOCIATES ABSENT (${
          associatesAbsent.length
        })</div>
        <div class="member-list">
          ${associatesAbsent
            .map((m: Member) => `<div class="member-item">${m.full_name}</div>`)
            .join("")}
        </div>
      </div>
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>${organizationInfo.name || "CHARISWORD CAMPUS MINISTRY"} | ${
      organizationInfo.address || ""
    } | ${organizationInfo.phone || ""} | ${organizationInfo.email || ""}</p>
      </div>
    </body>
    </html>
    `;
  };

  const membersPresent = members.filter(
    (m) =>
      m.member_status_at_time === "Member" && m.attendance_status === "Present"
  );
  const membersAbsent = members.filter(
    (m) =>
      m.member_status_at_time === "Member" && m.attendance_status === "Absent"
  );
  const associatesPresent = members.filter(
    (m) =>
      m.member_status_at_time === "Associate" &&
      m.attendance_status === "Present"
  );
  const associatesAbsent = members.filter(
    (m) =>
      m.member_status_at_time === "Associate" &&
      m.attendance_status === "Absent"
  );
  const firstTimersPresent = members.filter(
    (m) =>
      m.member_status_at_time === "FirstTimer" &&
      m.attendance_status === "Present"
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Detailed Attendance Report</CardTitle>
          <CardDescription>
            Generate and download detailed attendance reports for specific
            services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-2">
                Select Service
              </label>
              <Select
                value={selectedServiceId?.toString() || ""}
                onValueChange={(value) => setSelectedServiceId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem
                      key={service.service_id}
                      value={service.service_id.toString()}
                    >
                      {new Date(service.service_date).toLocaleDateString()} -{" "}
                      {service.service_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/2 flex items-end">
              <Button
                onClick={downloadReport}
                disabled={!selectedServiceId || downloading}
                className="w-full"
              >
                {downloading ? "Preparing Report..." : "Download Report"}
              </Button>
            </div>
          </div>

          {service && summary && (
            <div className="mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">
                  {organizationInfo?.name || "CHARISWORD CAMPUS MINISTRY"}
                </h2>
                <h3 className="text-xl font-semibold">
                  ATTENDANCE REPORT {service.service_type.toUpperCase()}
                </h3>
                <p>
                  {new Date(service.service_date)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })
                    .replace(/\//g, "-")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">MEMBERS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Total Membership:</span>
                      <span className="font-medium">
                        {summary.members.present + summary.members.absent}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Present:</span>
                      <span className="font-medium text-green-600">
                        {summary.members.present}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent:</span>
                      <span className="font-medium text-red-600">
                        {summary.members.absent}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ASSOCIATES</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Total Associates:</span>
                      <span className="font-medium">
                        {summary.associates.present + summary.associates.absent}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Present:</span>
                      <span className="font-medium text-green-600">
                        {summary.associates.present}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent:</span>
                      <span className="font-medium text-red-600">
                        {summary.associates.absent}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">FIRST TIMERS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <span className="font-medium text-green-600">
                        {summary.firstTimers.present}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-6" />

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      MEMBERS PRESENT ({membersPresent.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {membersPresent.map((member) => (
                        <div
                          key={member.member_id}
                          className="p-2 border rounded"
                        >
                          {member.full_name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {firstTimersPresent.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">
                        FIRST TIMERS ({firstTimersPresent.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {firstTimersPresent.map((member) => (
                          <div
                            key={member.member_id}
                            className="p-2 border rounded"
                          >
                            <div className="font-medium">
                              {member.full_name}
                            </div>
                            {member.phone && (
                              <div className="text-sm text-gray-600">
                                {member.phone}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      ASSOCIATES PRESENT ({associatesPresent.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {associatesPresent.map((member) => (
                        <div
                          key={member.member_id}
                          className="p-2 border rounded"
                        >
                          {member.full_name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      MEMBERS ABSENT ({membersAbsent.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {membersAbsent.map((member) => (
                        <div
                          key={member.member_id}
                          className="p-2 border rounded"
                        >
                          {member.full_name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      ASSOCIATES ABSENT ({associatesAbsent.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {associatesAbsent.map((member) => (
                        <div
                          key={member.member_id}
                          className="p-2 border rounded"
                        >
                          {member.full_name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500 mt-8">
                    <p>
                      Generated on {new Date().toLocaleDateString()} at{" "}
                      {new Date().toLocaleTimeString()}
                    </p>
                    <p>
                      {organizationInfo?.name || "CHARISWORD CAMPUS MINISTRY"} |{" "}
                      {organizationInfo?.address || ""} |{" "}
                      {organizationInfo?.phone || ""} |{" "}
                      {organizationInfo?.email || ""}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
