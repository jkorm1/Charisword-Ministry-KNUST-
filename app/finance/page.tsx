// app/finance/page.tsx (updated)
"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { PartnershipForm } from "@/components/partnership-form";
import { OfferingForm } from "@/components/offering-form";
import { PaymentFormNew } from "@/components/payment-form-new";
import { FinanceReports } from "@/components/finance-reports";
import { PaymentReports } from "@/components/payment-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function FinanceContent() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-coffee mb-2">
          Finance Management
        </h1>
        <p className="text-gray-600">
          Record partnerships, offerings, and payments
        </p>
      </div>

      <Tabs defaultValue="partnerships" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="offerings">Offerings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="partnerships">
          <PartnershipForm />
        </TabsContent>

        <TabsContent value="offerings">
          <OfferingForm />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentFormNew />
        </TabsContent>

        <TabsContent value="reports">
          <Tabs defaultValue="offerings" className="space-y-6">
            <TabsContent value="offerings">
              <FinanceReports />
            </TabsContent>

            <TabsContent value="partnerships">
              <FinanceReports />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentReports />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FinancePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "finance_leader", "cell_leader"]}>
      <FinanceContent />
    </ProtectedRoute>
  );
}
