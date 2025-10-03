"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AttendanceRecorder } from "@/components/attendance-recorder";
import { FirstTimerForm } from "@/components/first-timer-form";
import { AttendanceReports } from "@/components/attendance-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AttendanceContent() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-coffee mb-2">
          Attendance Management
        </h1>
        <p className="text-gray-600">
          Record member attendance and first-timers
        </p>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Record Attendance</TabsTrigger>
          <TabsTrigger value="first-timers">First-Timers</TabsTrigger>
          <TabsTrigger value="reports">View Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <AttendanceRecorder />
        </TabsContent>

        <TabsContent value="first-timers">
          <FirstTimerForm />
        </TabsContent>

        <TabsContent value="reports">
          <AttendanceReports userRole="cell_leader" assignedCellId={1} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "usher", "cell_leader"]}>
      <AttendanceContent />
    </ProtectedRoute>
  );
}
