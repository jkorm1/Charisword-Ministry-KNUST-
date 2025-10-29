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

interface MonthlyReport {
  month: string;
  offering: number;
  partnership: number;
  receipts: number;
  payments: number;
  balance: number;
}

interface PaymentCategory {
  category: string;
  items: {
    description: string;
    amount: number;
  }[];
  total: number;
}

export function PaymentReports() {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [paymentCategories, setPaymentCategories] = useState<PaymentCategory[]>(
    []
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyReports();
    fetchPaymentCategories();
  }, [selectedYear]);

  const fetchMonthlyReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/monthly?year=${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setMonthlyReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentCategories = async () => {
    try {
      const response = await fetch(
        `/api/reports/payment-categories?year=${selectedYear}`
      );
      if (!response.ok) throw new Error("Failed to fetch payment categories");
      const data = await response.json();
      setPaymentCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const calculateTotals = () => {
    return monthlyReports.reduce(
      (acc, report) => ({
        offering: acc.offering + report.offering,
        partnership: acc.partnership + report.partnership,
        receipts: acc.receipts + report.receipts,
        payments: acc.payments + report.payments,
        balance: acc.balance + report.balance,
      }),
      { offering: 0, partnership: 0, receipts: 0, payments: 0, balance: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            CHARISWORD CAMPUS MINISTRY
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Year Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Label htmlFor="year">Select Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Report</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-4">Loading reports...</p>}
          {error && <p className="text-red-500 text-center py-4">{error}</p>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Offering</TableHead>
                <TableHead>Partnership</TableHead>
                <TableHead>Receipts</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyReports.map((report) => (
                <TableRow key={report.month}>
                  <TableCell className="font-semibold">
                    {report.month}
                  </TableCell>
                  <TableCell>{formatCurrency(report.offering)}</TableCell>
                  <TableCell>{formatCurrency(report.partnership)}</TableCell>
                  <TableCell>{formatCurrency(report.receipts)}</TableCell>
                  <TableCell>{formatCurrency(report.payments)}</TableCell>
                  <TableCell
                    className={
                      report.balance >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatCurrency(report.balance)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-gray-50">
                <TableCell>Total</TableCell>
                <TableCell>{formatCurrency(totals.offering)}</TableCell>
                <TableCell>{formatCurrency(totals.partnership)}</TableCell>
                <TableCell>{formatCurrency(totals.receipts)}</TableCell>
                <TableCell>{formatCurrency(totals.payments)}</TableCell>
                <TableCell
                  className={
                    totals.balance >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatCurrency(totals.balance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentCategories.map((category) => (
              <div key={category.category} className="space-y-2">
                <h3 className="font-semibold text-lg">{category.category}</h3>
                <Table>
                  <TableBody>
                    {category.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(category.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
