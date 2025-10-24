"use client";

import type React from "react";
import { useState, useEffect } from "react";
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

interface RegularType {
  regular_type_id: string;
  type_name: string;
  description?: string;
  created_at?: string;
}

interface Expense {
  expense_id: number;
  expense_name: string;
  amount: number;
  checked: boolean;
  is_custom?: boolean;
  default_amount?: number;
  is_existing?: boolean;
  is_to_delete?: boolean;
  payment_date?: string;
}

interface PaymentReport {
  payment_id: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  description: string;
  recorded_by: string;
  reference_id: string;
  reference_type: string;
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
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [programSuccess, setProgramSuccess] = useState(false);
  const [regularSuccess, setRegularSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingPayments, setExistingPayments] = useState<PaymentReport[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [newProgram, setNewProgram] = useState({
    program_name: "",
    program_date: "",
    description: "",
  });
  const [programPayments, setProgramPayments] = useState<PaymentReport[]>([]);
  const [isProgramUpdating, setIsProgramUpdating] = useState(false);
  const [programExpenses, setProgramExpenses] = useState<Expense[]>([]);
  const [regularExpenses, setRegularExpenses] = useState<Expense[]>([]);
  const [isRegularUpdating, setIsRegularUpdating] = useState(false);

  const formatPaymentDate = (dateString: string | undefined): string => {
    if (!dateString) return "No date";
    try {
      // Parse YYYY-MM-DD format safely
      const [year, month, day] = dateString.split("-");
      if (year && month && day) {
        return new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        ).toLocaleDateString();
      }
      return "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

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
    setLoadingPrograms(true);
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
    } finally {
      setLoadingPrograms(false);
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
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
      setError("Failed to fetch recurring expenses");
    }
  };

  const fetchExistingServicePayments = async (serviceId: string) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(
        `/api/payments?reference_id=${serviceId}&reference_type=service`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch existing payments");
      const data = await response.json();
      const servicePayments = data.filter(
        (payment: PaymentReport) =>
          payment.reference_id === serviceId &&
          payment.reference_type === "service"
      );

      setExistingPayments(servicePayments);
      setIsUpdating(servicePayments.length > 0);

      const existingExpenses = servicePayments.map(
        (payment: PaymentReport): Expense => ({
          expense_id: payment.payment_id,
          expense_name: payment.description,
          amount: payment.amount,
          checked: true,
          is_custom: true,
          is_existing: true,
          is_to_delete: false,
          payment_date: payment.payment_date,
        })
      );

      const unrecordedRecurring = recurringExpenses
        .filter(
          (expense) =>
            !data.some(
              (payment) => payment.description === expense.expense_name
            )
        )
        .map(
          (expense): Expense => ({
            expense_id: expense.expense_id,
            expense_name: expense.expense_name,
            amount: expense.default_amount,
            checked: false,
            is_custom: false,
            default_amount: expense.default_amount,
            is_to_delete: false,
            payment_date: undefined,
          })
        );

      setExpenses([...existingExpenses, ...unrecordedRecurring]);
    } catch (error) {
      console.error("Error fetching existing payments:", error);
      setError("Failed to fetch existing payments");
    }
  };

  const handleServiceSelect = async (serviceId: string) => {
    setSelectedService(serviceId);
    setExpenses([]);
    setExistingPayments([]);
    setError(null);
    setServiceSuccess(false);
    setIsUpdating(false);

    if (serviceId) {
      try {
        await Promise.all([
          fetchRecurringExpenses(),
          fetchExistingServicePayments(serviceId),
        ]);
      } catch (error) {
        console.error("Error fetching service data:", error);
        setError("Failed to fetch service data");
      }
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.program_name || !newProgram.program_date) {
      setError("Program name and date are required");
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProgram),
      });

      if (!response.ok) {
        throw new Error("Failed to create program");
      }

      await fetchPrograms();
      setNewProgram({ program_name: "", program_date: "", description: "" });
      setShowProgramForm(false);
      setSuccessMessage("Program created successfully!");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create program"
      );
    }
  };

  const handleProgramSelect = async (programId: string) => {
    console.log("Selecting program:", programId);
    setSelectedProgram(programId);
    setError(null);
    setSuccessMessage(null);
    setProgramExpenses([]);

    if (programId) {
      try {
        const token = localStorage.getItem("auth-token");

        const response = await fetch(`/api/programs/${programId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("API Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(
            errorData.error || "Failed to fetch program payments"
          );
        }

        const data = await response.json();
        console.log("Received program payments:", data);

        const existingExpenses = data.map(
          (payment: PaymentReport): Expense => ({
            expense_id: payment.payment_id,
            expense_name: payment.description,
            amount: Number.parseFloat(payment.amount),
            checked: true,
            is_custom: true,
            is_existing: true,
            is_to_delete: false,
            payment_date: payment.payment_date,
          })
        );

        setProgramExpenses(existingExpenses);
        setIsProgramUpdating(existingExpenses.length > 0);
      } catch (error) {
        console.error("Error in handleProgramSelect:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch program payments"
        );
      }
    } else {
      setProgramExpenses([]);
      setIsProgramUpdating(false);
    }
  };

  const fetchRegularPayments = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/payments?payment_category=regular", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch regular payments");
      const data = await response.json();
      console.log("[v0] Regular payments response:", data);

      const regularPaymentsOnly = data.filter(
        (payment: PaymentReport) =>
          payment.payment_category === "regular" &&
          !payment.reference_id &&
          !payment.reference_type
      );
      console.log("[v0] Filtered regular payments:", regularPaymentsOnly);

      // Convert existing payments to expenses
      const existingExpenses = regularPaymentsOnly.map(
        (payment: PaymentReport): Expense => ({
          expense_id: payment.payment_id,
          expense_name: payment.description,
          amount: Number.parseFloat(payment.amount),
          checked: true,
          is_custom: true,
          is_existing: true,
          is_to_delete: false,
          payment_date: payment.payment_date,
        })
      );

      setRegularExpenses(existingExpenses);
      setIsRegularUpdating(existingExpenses.length > 0);
    } catch (error) {
      console.error("Error fetching regular payments:", error);
      setError("Failed to fetch regular payments");
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

    const currentExpenses =
      activeTab === "program"
        ? programExpenses
        : activeTab === "regular"
        ? regularExpenses
        : expenses;
    const checkedExpenses = currentExpenses.filter((e) => e.checked);

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
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("auth-token");
      let expensesToProcess: Expense[] = [];

      if (activeTab === "program") {
        expensesToProcess = programExpenses;
      } else if (activeTab === "regular") {
        expensesToProcess = regularExpenses;
      } else {
        expensesToProcess = expenses;
      }

      const checkedExpenses = expensesToProcess.filter((e) => e.checked);
      const expensesToDelete = expensesToProcess.filter(
        (e) => e.is_existing && !e.checked
      );

      for (const expense of expensesToDelete) {
        const response = await fetch(`/api/payments/${expense.expense_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Delete response:", errorText);
          throw new Error(errorText || "Failed to delete payment");
        }
      }

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
          is_recurring: false,
          payment_date: paymentDate,
        };

        const response = await fetch("/api/payments", {
          method: expense.is_existing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...paymentData,
            payment_id: expense.is_existing ? expense.expense_id : undefined,
          }),
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

      if (activeTab === "service") {
        setSuccessMessage("Service payments updated successfully!");
        await fetchExistingServicePayments(selectedService);
      } else if (activeTab === "program") {
        setSuccessMessage("Program payments updated successfully!");
        await handleProgramSelect(selectedProgram);
      } else if (activeTab === "regular") {
        setSuccessMessage("Regular payments updated successfully!");
        await fetchRegularPayments();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPrograms();
    if (activeTab === "service") {
      fetchRecurringExpenses();
    } else if (activeTab === "regular") {
      fetchRegularPayments();
    }
  }, [activeTab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as any);
            setSuccessMessage(null);
          }}
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
                onValueChange={handleServiceSelect}
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

            {selectedService && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Service Expenses</h3>
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
                        is_to_delete: false,
                      };
                      setExpenses([...expenses, newExpense]);
                    }}
                  >
                    Add Custom Expense
                  </Button>
                </div>
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.expense_id}
                      className={`flex items-center space-x-4 p-2 border rounded ${
                        expense.is_existing && !expense.checked
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <Checkbox
                        checked={expense.checked}
                        onCheckedChange={(checked) => {
                          setExpenses((prev) =>
                            prev.map((e) => {
                              if (e.expense_id === expense.expense_id) {
                                return {
                                  ...e,
                                  checked: Boolean(checked),
                                  is_to_delete: e.is_existing && !checked,
                                };
                              }
                              return e;
                            })
                          );
                        }}
                      />
                      {expense.is_custom ? (
                        <Input
                          placeholder="Expense name"
                          value={expense.expense_name}
                          onChange={(event) => {
                            setExpenses((prev) =>
                              prev.map((e) =>
                                e.expense_id === expense.expense_id
                                  ? { ...e, expense_name: event.target.value }
                                  : e
                              )
                            );
                          }}
                          className="flex-1"
                        />
                      ) : (
                        <span className="flex-1">{expense.expense_name}</span>
                      )}
                      <Input
                        type="number"
                        step="0.01"
                        value={expense.amount}
                        onChange={(event) => {
                          setExpenses((prev) =>
                            prev.map((e) =>
                              e.expense_id === expense.expense_id
                                ? {
                                    ...e,
                                    amount:
                                      Number.parseFloat(event.target.value) ||
                                      0,
                                  }
                                : e
                            )
                          );
                        }}
                        className="w-32"
                      />
                      {expense.is_existing &&
                        (() => {
                          const payment = existingPayments.find(
                            (p) => p.payment_id === expense.expense_id
                          );
                          return (
                            <span className="text-sm text-gray-500">
                              {new Date(
                                expense.payment_date
                              ).toLocaleDateString()}
                              {!expense.checked && (
                                <span className="text-red-500 ml-2">
                                  (Will be deleted)
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      {submittingExpenses.has(expense.expense_id) && (
                        <span className="text-sm text-gray-500">
                          Updating...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {successMessage && activeTab === "service" && (
              <p className="text-green-500 text-sm">{successMessage}</p>
            )}
          </TabsContent>
          <TabsContent value="program" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="program">Select Program</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowProgramForm(!showProgramForm)}
              >
                {showProgramForm ? "Cancel" : "New Program"}
              </Button>
            </div>

            {showProgramForm && (
              <div className="space-y-2 p-3 border rounded">
                <Input
                  placeholder="Program Name"
                  value={newProgram.program_name}
                  onChange={(e) =>
                    setNewProgram((prev) => ({
                      ...prev,
                      program_name: e.target.value,
                    }))
                  }
                />
                <Input
                  type="date"
                  value={newProgram.program_date}
                  onChange={(e) =>
                    setNewProgram((prev) => ({
                      ...prev,
                      program_date: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Description (optional)"
                  value={newProgram.description}
                  onChange={(e) =>
                    setNewProgram((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <Button onClick={handleCreateProgram} className="w-full">
                  Create Program
                </Button>
              </div>
            )}

            <Select
              value={selectedProgram}
              onValueChange={handleProgramSelect}
              disabled={loadingPrograms}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingPrograms ? "Loading programs..." : "Select a program"
                  }
                />
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

            {selectedProgram && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    Program Expenses {isProgramUpdating && "(Update Mode)"}
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
                        is_to_delete: false,
                      };
                      setProgramExpenses([...programExpenses, newExpense]);
                    }}
                  >
                    Add Expense
                  </Button>
                </div>
                <div className="space-y-2">
                  {programExpenses.map((expense) => (
                    <div
                      key={expense.expense_id}
                      className={`flex items-center space-x-4 p-2 border rounded ${
                        expense.is_existing && !expense.checked
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <Checkbox
                        checked={expense.checked}
                        onCheckedChange={(checked) => {
                          setProgramExpenses((prev) =>
                            prev.map((e) => {
                              if (e.expense_id === expense.expense_id) {
                                return {
                                  ...e,
                                  checked: Boolean(checked),
                                  is_to_delete: e.is_existing && !checked,
                                };
                              }
                              return e;
                            })
                          );
                        }}
                      />
                      <Input
                        placeholder="Expense name"
                        value={expense.expense_name}
                        onChange={(event) => {
                          setProgramExpenses((prev) =>
                            prev.map((e) =>
                              e.expense_id === expense.expense_id
                                ? { ...e, expense_name: event.target.value }
                                : e
                            )
                          );
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={expense.amount}
                        onChange={(event) => {
                          setProgramExpenses((prev) =>
                            prev.map((e) =>
                              e.expense_id === expense.expense_id
                                ? {
                                    ...e,
                                    amount:
                                      Number.parseFloat(event.target.value) ||
                                      0,
                                  }
                                : e
                            )
                          );
                        }}
                        className="w-32"
                      />
                      {expense.is_existing && expense.payment_date && (
                        <span className="text-sm text-gray-500">
                          {new Date(expense.payment_date).toLocaleDateString()}
                          {!expense.checked && (
                            <span className="text-red-500 ml-2">
                              (Will be deleted)
                            </span>
                          )}
                        </span>
                      )}
                      {submittingExpenses.has(expense.expense_id) && (
                        <span className="text-sm text-gray-500">
                          Updating...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {successMessage && activeTab === "program" && (
              <p className="text-green-500 text-sm">{successMessage}</p>
            )}
          </TabsContent>

          <TabsContent value="regular" className="space-y-4">
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  Regular Expenses {isRegularUpdating && "(Update Mode)"}
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
                      is_to_delete: false,
                    };
                    setRegularExpenses([...regularExpenses, newExpense]);
                  }}
                >
                  Add Expense
                </Button>
              </div>
              <div className="space-y-2">
                {regularExpenses.map((expense) => (
                  <div
                    key={expense.expense_id}
                    className={`flex items-center space-x-4 p-2 border rounded ${
                      expense.is_existing && !expense.checked
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <Checkbox
                      checked={expense.checked}
                      onCheckedChange={(checked) => {
                        setRegularExpenses((prev) =>
                          prev.map((e) => {
                            if (e.expense_id === expense.expense_id) {
                              return {
                                ...e,
                                checked: Boolean(checked),
                                is_to_delete: e.is_existing && !checked,
                              };
                            }
                            return e;
                          })
                        );
                      }}
                    />
                    <Input
                      placeholder="Expense name"
                      value={expense.expense_name}
                      onChange={(event) => {
                        setRegularExpenses((prev) =>
                          prev.map((e) =>
                            e.expense_id === expense.expense_id
                              ? { ...e, expense_name: event.target.value }
                              : e
                          )
                        );
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={expense.amount}
                      onChange={(event) => {
                        setRegularExpenses((prev) =>
                          prev.map((e) =>
                            e.expense_id === expense.expense_id
                              ? {
                                  ...e,
                                  amount:
                                    Number.parseFloat(event.target.value) || 0,
                                }
                              : e
                          )
                        );
                      }}
                      className="w-32"
                    />
                    {expense.is_existing && expense.payment_date && (
                      <span className="text-sm text-gray-500">
                        {new Date(expense.payment_date).toLocaleDateString()}
                        {!expense.checked && (
                          <span className="text-red-500 ml-2">
                            (Will be deleted)
                          </span>
                        )}
                      </span>
                    )}
                    {submittingExpenses.has(expense.expense_id) && (
                      <span className="text-sm text-gray-500">Updating...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {successMessage && activeTab === "regular" && (
              <p className="text-green-500 text-sm">{successMessage}</p>
            )}
          </TabsContent>
        </Tabs>

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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            onClick={handleSubmit}
          >
            {loading ? "Updating..." : "Update Payments"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
