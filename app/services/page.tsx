"use client";

import React from "react";
import { ProtectedRoute } from "@/components/protected-route";
import ServiceManagement from "@/components/ServiceManagement";

export default function ServicesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "usher"]}>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee mb-2">
            Service Management
          </h1>
          <p className="text-gray-600">Create and manage church services</p>
        </div>
        <ServiceManagement />
      </div>
    </ProtectedRoute>
  );
}
