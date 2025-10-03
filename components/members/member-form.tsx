// components/members/member-form.tsx
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Member {
  member_id: number;
  full_name: string;
  gender: string;
  residence?: string;
  phone?: string;
  email?: string;
  cell_name?: string;
  fold_name?: string;
  membership_status: string;
  date_joined: string;
}

interface Cell {
  cell_id: number;
  name: string;
}

interface Fold {
  fold_id: number;
  name: string;
  cell_id: number;
}

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingMember: Member | null;
  cells: Cell[];
  folds: Fold[];
}

export function MemberForm({
  isOpen,
  onClose,
  onSave,
  editingMember,
  cells,
  folds,
}: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    residence: "",
    phone: "",
    email: "",
    cell_id: "",
    fold_id: "",
    membership_status: "Member",
  });
  const { toast } = useToast();

  const [availableFolds, setAvailableFolds] = useState<Fold[]>([]);

  useEffect(() => {
    if (editingMember) {
      const cellId =
        cells
          .find((c) => c.name === editingMember.cell_name)
          ?.cell_id.toString() || "";
      const foldId =
        folds
          .find((f) => f.name === editingMember.fold_name)
          ?.fold_id.toString() || "";

      setFormData({
        full_name: editingMember.full_name,
        gender: editingMember.gender,
        residence: editingMember.residence || "",
        phone: editingMember.phone || "",
        email: editingMember.email || "",
        cell_id: cellId,
        fold_id: foldId,
        membership_status: editingMember.membership_status,
      });

      if (cellId) {
        fetchFoldsForCell(cellId);
      }
    } else {
      setFormData({
        full_name: "",
        gender: "",
        residence: "",
        phone: "",
        email: "",
        cell_id: "",
        fold_id: "",
        membership_status: "Member",
      });
    }
  }, [editingMember, cells, folds]);

  const fetchFoldsForCell = async (cellId: string) => {
    try {
      const response = await fetch(`/api/folds?cellId=${cellId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableFolds(data); // Store the fetched folds
      }
    } catch (error) {
      console.error("Error fetching folds:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "cell_id") {
      if (value) {
        fetchFoldsForCell(value);
      } else {
        setAvailableFolds([]); // Clear folds if no cell selected
      }
      // Reset fold selection when cell changes
      setFormData((prev) => ({ ...prev, fold_id: "" }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Add validation
    if (!formData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      toast({
        title: "Validation Error",
        description: "Gender is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Convert string IDs to numbers for the API, ensuring proper handling of empty strings
      const apiFormData = {
        ...formData,
        cell_id:
          formData.cell_id && formData.cell_id.trim() !== ""
            ? Number.parseInt(formData.cell_id)
            : null,
        fold_id:
          formData.fold_id && formData.fold_id.trim() !== ""
            ? Number.parseInt(formData.fold_id)
            : null,
      };

      console.log("Submitting data:", apiFormData);

      const url = editingMember
        ? `/api/members/${editingMember.member_id}`
        : "/api/members";
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiFormData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        // Enhanced success feedback
        const memberName = formData.full_name;
        const action = editingMember ? "updated" : "created";
        const cellName = formData.cell_id
          ? cells.find((c) => c.cell_id.toString() === formData.cell_id)?.name
          : "no cell";
        const foldName = formData.fold_id
          ? availableFolds.find(
              (f) => f.fold_id.toString() === formData.fold_id
            )?.name
          : null;

        // Create a more detailed success message
        let successMessage = `${memberName} has been successfully ${action}.`;
        if (cellName !== "no cell") {
          successMessage += ` They have been added to ${cellName}`;
          if (foldName) {
            successMessage += ` (${foldName} fold)`;
          }
          successMessage += ".";
        }

        // Show the toast notification
        toast({
          title: `Member ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          description: successMessage,
          variant: "default", // Use default style for success
        });

        // Reset form and close dialog
        setFormData({
          full_name: "",
          gender: "",
          residence: "",
          phone: "",
          email: "",
          cell_id: "",
          fold_id: "",
          membership_status: "Member",
        });
        setAvailableFolds([]);
        onSave();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update the member information below."
                : "Create a new member profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="residence" className="text-right">
                Residence
              </Label>
              <Input
                id="residence"
                value={formData.residence}
                onChange={(e) => handleInputChange("residence", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cell" className="text-right">
                Cell
              </Label>
              <Select
                value={formData.cell_id}
                onValueChange={(value) => handleInputChange("cell_id", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select cell" />
                </SelectTrigger>
                <SelectContent>
                  {cells.map((cell) => (
                    <SelectItem
                      key={cell.cell_id}
                      value={cell.cell_id.toString()}
                    >
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.cell_id && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fold" className="text-right">
                  Fold
                </Label>
                <Select
                  value={formData.fold_id}
                  onValueChange={(value) => handleInputChange("fold_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select fold" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFolds.map((fold) => (
                      <SelectItem
                        key={fold.fold_id}
                        value={fold.fold_id.toString()}
                      >
                        {fold.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.membership_status}
                onValueChange={(value) =>
                  handleInputChange("membership_status", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Associate">Associate</SelectItem>
                  <SelectItem value="FirstTimer">First Timer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingMember
                ? "Update Member"
                : "Create Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
