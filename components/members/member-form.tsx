// components/members/member-form.tsx
"use client";

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
  id: number;
  full_name: string;
  gender: string;
  residence?: string;
  phone?: string;
  email?: string;
  cell_name?: string;
  fold_name?: string;
  membership_status: string;
  join_date: string;
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

  useEffect(() => {
    if (editingMember) {
      setFormData({
        full_name: editingMember.full_name,
        gender: editingMember.gender,
        residence: editingMember.residence || "",
        phone: editingMember.phone || "",
        email: editingMember.email || "",
        cell_id: editingMember.cell_name || "",
        fold_id: editingMember.fold_name || "",
        membership_status: editingMember.membership_status,
      });
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
  }, [editingMember]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string IDs to numbers for the API
      const apiFormData = {
        ...formData,
        cell_id: formData.cell_id ? parseInt(formData.cell_id) : null,
        fold_id: formData.fold_id ? parseInt(formData.fold_id) : null,
      };

      const url = editingMember
        ? `/api/members/${editingMember.id}`
        : "/api/members";
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiFormData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingMember
            ? "Member updated successfully"
            : "Member created successfully",
        });
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
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
                    {folds
                      .filter(
                        (fold) =>
                          !formData.cell_id ||
                          fold.cell_id === parseInt(formData.cell_id)
                      )
                      .map((fold) => (
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
