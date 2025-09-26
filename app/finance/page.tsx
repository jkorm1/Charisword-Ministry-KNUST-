"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { PartnershipForm } from "@/components/partnership-form";
import { OfferingForm } from "@/components/offering-form";
import { FinanceReports } from "@/components/finance-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function FinanceContent() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-coffee mb-2">
          Finance Management
        </h1>
        <p className="text-gray-600">Record partnerships and offerings</p>
      </div>

      <Tabs defaultValue="partnerships" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="offerings">Offerings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="partnerships">
          <PartnershipForm />
        </TabsContent>

        <TabsContent value="offerings">
          <OfferingForm />
        </TabsContent>

        <TabsContent value="reports">
          <FinanceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FinancePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "finance_leader"]}>
      <FinanceContent />
    </ProtectedRoute>
  );
}
