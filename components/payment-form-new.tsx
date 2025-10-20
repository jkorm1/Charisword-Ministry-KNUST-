// components/payment-form-new.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Type definitions
interface RecurringExpense {
  expense_id: number;
  expense_name: string;
  default_amount: number;
  is_active: boolean;
}

interface Expense {
  expense_id: number;
  expense_name: string;
  amount: number;
  checked: boolean;
  is_custom?: boolean;
  default_amount?: number;
}

export function PaymentFormNew() {
  const [activeTab, setActiveTab] = useState<"service" | "program" | "regular">(
    "service"
  );
  const [services, setServices] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingExpenses, setSubmittingExpenses] = useState<Set<number>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
    fetchPrograms();
    // Only fetch recurring expenses when on service tab
    if (activeTab === "service") {
      fetchRecurringExpenses();
    } else {
      // Clear expenses when switching away from service tab
      setExpenses([]);
    }
  }, [activeTab]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to fetch services");
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/programs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch programs");
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setError("Failed to fetch programs");
    }
  };

  const fetchRecurringExpenses = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/recurring-expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch recurring expenses");
      const data = await response.json();
      setRecurringExpenses(data);
      // Only set expenses if we're still on the service tab
      if (activeTab === "service") {
        setExpenses(
          data.map(
            (expense: RecurringExpense): Expense => ({
              expense_id: expense.expense_id,
              expense_name: expense.expense_name,
              amount: expense.default_amount,
              checked: true,
              default_amount: expense.default_amount,
            })
          )
        );
      }
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
      setError("Failed to fetch recurring expenses");
    }
  };

  const validateForm = () => {
    if (activeTab === "service" && !selectedService) {
      setError("Please select a service");
      return false;
    }
    if (activeTab === "program" && !selectedProgram) {
      setError("Please select a program");
      return false;
    }
    if (!paymentDate) {
      setError("Please select a payment date");
      return false;
    }
    const checkedExpenses = expenses.filter((e) => e.checked);
    if (checkedExpenses.length === 0) {
      setError("Please select at least one expense");
      return false;
    }
    const invalidCustomExpense = checkedExpenses.find(
      (e) => e.is_custom && (!e.expense_name || !e.amount)
    );
    if (invalidCustomExpense) {
      setError("Please fill in all custom expense details");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("auth-token");
      const checkedExpenses = expenses.filter((e) => e.checked);

      for (const expense of checkedExpenses) {
        setSubmittingExpenses((prev) => new Set(prev).add(expense.expense_id));

        const paymentData = {
          amount: expense.amount,
          payment_type:
            activeTab === "service"
              ? "Service Expense"
              : activeTab === "program"
              ? "Program Expense"
              : "Regular Expense",
          payment_category: activeTab,
          reference_id:
            activeTab === "service"
              ? selectedService
              : activeTab === "program"
              ? selectedProgram
              : null,
          reference_type:
            activeTab === "service"
              ? "service"
              : activeTab === "program"
              ? "program"
              : null,
          description: expense.expense_name,
          is_recurring: activeTab === "service" && !expense.is_custom, // Only mark as recurring if it's a service expense and not custom
          payment_date: paymentDate,
        };

        const response = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to record payment");
        }

        setSubmittingExpenses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(expense.expense_id);
          return newSet;
        });
      }

      setSuccess("All payments recorded successfully!");
      // Reset form
      if (activeTab === "service") {
        setExpenses(
          recurringExpenses.map(
            (expense): Expense => ({
              expense_id: expense.expense_id,
              expense_name: expense.expense_name,
              amount: expense.default_amount,
              checked: true,
              default_amount: expense.default_amount,
            })
          )
        );
      } else {
        setExpenses([]);
      }
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="service">Service Payments</TabsTrigger>
            <TabsTrigger value="program">Program Payments</TabsTrigger>
            <TabsTrigger value="regular">Regular Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="space-y-4">
            <div>
              <Label htmlFor="service">Select Service</Label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem
                      key={service.service_id}
                      value={service.service_id}
                    >
                      {new Date(service.service_date).toLocaleDateString()} -{" "}
                      {service.service_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="program" className="space-y-4">
            <div>
              <Label htmlFor="program">Select Program</Label>
              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem
                      key={program.program_id}
                      value={program.program_id}
                    >
                      {program.program_name} -{" "}
                      {new Date(program.program_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="regular" className="space-y-4">
            <p className="text-sm text-gray-600">
              Record regular church expenses
            </p>
          </TabsContent>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {activeTab === "service"
                  ? "Service Expenses"
                  : activeTab === "program"
                  ? "Program Expenses"
                  : "Regular Expenses"}
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newExpense: Expense = {
                    expense_id: Date.now(),
                    expense_name: "",
                    amount: 0,
                    checked: true,
                    is_custom: true,
                  };
                  setExpenses([...expenses, newExpense]);
                }}
              >
                Add Custom Expense
              </Button>
            </div>

            {expenses.map((expense, index) => (
              <div
                key={expense.expense_id}
                className="flex items-center space-x-4"
              >
                <Checkbox
                  checked={expense.checked}
                  onCheckedChange={(checked: boolean) => {
                    if (expense.is_custom) {
                      setExpenses(
                        expenses.map((e, i) =>
                          i === index ? { ...e, checked } : e
                        )
                      );
                    } else {
                      setExpenses(
                        expenses.map((e) =>
                          e.expense_id === expense.expense_id
                            ? {
                                ...e,
                                checked,
                                amount: checked ? e.default_amount || 0 : 0,
                              }
                            : e
                        )
                      );
                    }
                  }}
                />
                {expense.is_custom ? (
                  <>
                    <Input
                      placeholder="Expense name"
                      value={expense.expense_name}
                      onChange={(
                        event // Changed from 'e' to 'event'
                      ) =>
                        setExpenses(
                          expenses.map(
                            (
                              expense,
                              i // Changed variable names to be clearer
                            ) =>
                              i === index
                                ? {
                                    ...expense,
                                    expense_name: event.target.value,
                                  } // Use event.target.value
                                : expense
                          )
                        )
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(
                        event // Changed from 'e' to 'event'
                      ) =>
                        setExpenses(
                          expenses.map(
                            (
                              expense,
                              i // Changed variable names to be clearer
                            ) =>
                              i === index
                                ? {
                                    ...expense,
                                    amount: parseFloat(event.target.value) || 0, // Use event.target.value
                                  }
                                : expense
                          )
                        )
                      }
                      className="w-32"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={expense.amount}
                      onChange={(
                        event // Changed from 'e' to 'event'
                      ) =>
                        setExpenses(
                          expenses.map((e) =>
                            e.expense_id === expense.expense_id
                              ? {
                                  ...e,
                                  amount: parseFloat(event.target.value) || 0, // Use event.target.value
                                }
                              : e
                          )
                        )
                      }
                      className="w-32"
                    />
                  </>
                ) : (
                  <>
                    <span className="flex-1">{expense.expense_name}</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={expense.amount}
                      onChange={(event) =>
                        setExpenses(
                          expenses.map((e) =>
                            e.expense_id === expense.expense_id
                              ? {
                                  ...e,
                                  amount: parseFloat(event.target.value) || 0,
                                }
                              : e
                          )
                        )
                      }
                      className="w-32"
                    />
                  </>
                )}
                {submittingExpenses.has(expense.expense_id) && (
                  <span className="text-sm text-gray-500">Recording...</span>
                )}
              </div>
            ))}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <Button
              type="submit"
              disabled={loading || !expenses.some((e) => e.checked)}
              className="w-full"
              onClick={handleSubmit}
            >
              {loading ? "Recording..." : "Record Payments"}
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
