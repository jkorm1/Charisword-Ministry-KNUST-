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
import { Plus, Trash2 } from "lucide-react";

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

interface FormMember {
  full_name: string;
  gender: string;
  residence: string;
  phone: string;
  email: string;
  cell_id: string;
  fold_id: string;
  membership_status: string;
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
  const [members, setMembers] = useState<FormMember[]>([
    {
      full_name: "",
      gender: "",
      residence: "",
      phone: "",
      email: "",
      cell_id: "",
      fold_id: "",
      membership_status: "Member",
    },
  ]);
  const [availableFolds, setAvailableFolds] = useState<Fold[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const [foldsByCell, setFoldsByCell] = useState<Record<string, Fold[]>>({});

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

      setMembers([
        {
          full_name: editingMember.full_name,
          gender: editingMember.gender,
          residence: editingMember.residence || "",
          phone: editingMember.phone || "",
          email: editingMember.email || "",
          cell_id: cellId,
          fold_id: foldId,
          membership_status: editingMember.membership_status,
        },
      ]);

      if (cellId) {
        fetchFoldsForCell(cellId);
      }
    } else {
      setMembers([
        {
          full_name: "",
          gender: "",
          residence: "",
          phone: "",
          email: "",
          cell_id: "",
          fold_id: "",
          membership_status: "Member",
        },
      ]);
    }
  }, [editingMember, cells, folds, isOpen]);

  const fetchFoldsForCell = async (cellId: string) => {
    try {
      const response = await fetch(`/api/folds?cellId=${cellId}`);
      if (response.ok) {
        const data = await response.json();
        setFoldsByCell((prev) => ({ ...prev, [cellId]: data }));
      }
    } catch (error) {
      console.error("Error fetching folds:", error);
    }
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "cell_id") {
      if (value) {
        fetchFoldsForCell(value);
      }
      updated[index].fold_id = "";
    }

    setMembers(updated);
  };

  const addMemberRow = () => {
    setMembers([
      ...members,
      {
        full_name: "",
        gender: "",
        residence: "",
        phone: "",
        email: "",
        cell_id: "",
        fold_id: "",
        membership_status: "Member",
      },
    ]);
  };

  const removeMemberRow = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate all members
    for (const member of members) {
      if (!member.full_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Full name is required for all members",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!member.gender) {
        toast({
          title: "Validation Error",
          description: "Gender is required for all members",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      if (editingMember) {
        // Single member edit
        const member = members[0];
        const apiFormData = {
          ...member,
          cell_id:
            member.cell_id && member.cell_id.trim() !== ""
              ? Number.parseInt(member.cell_id)
              : null,
          fold_id:
            member.fold_id && member.fold_id.trim() !== ""
              ? Number.parseInt(member.fold_id)
              : null,
        };

        const response = await fetch(
          `/api/members/${editingMember.member_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiFormData),
          }
        );

        if (response.ok) {
          toast({
            title: "Member Updated",
            description: `${member.full_name} has been successfully updated.`,
            variant: "default",
          });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.error || "Failed to update member",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } else {
        // Bulk add multiple members
        const apiFormData = members.map((member) => ({
          ...member,
          cell_id:
            member.cell_id && member.cell_id.trim() !== ""
              ? Number.parseInt(member.cell_id)
              : null,
          fold_id:
            member.fold_id && member.fold_id.trim() !== ""
              ? Number.parseInt(member.fold_id)
              : null,
        }));

        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members: apiFormData }),
        });

        if (response.ok) {
          const count = members.length;
          toast({
            title: "Members Added",
            description: `${count} member${
              count > 1 ? "s" : ""
            } have been successfully added.`,
            variant: "default",
          });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.error || "Failed to add members",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Reset and close
      setMembers([
        {
          full_name: "",
          gender: "",
          residence: "",
          phone: "",
          email: "",
          cell_id: "",
          fold_id: "",
          membership_status: "Member",
        },
      ]);
      setFoldsByCell({});
      onSave();
      onClose();
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add Members"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update the member information below."
                : "Add one or more members. Click 'Add Another Member' to add more."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {members.map((member, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-slate-50 relative"
              >
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMemberRow(index)}
                    className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                )}

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`full_name_${index}`}
                        className="text-sm font-medium"
                      >
                        Full Name
                      </Label>
                      <Input
                        id={`full_name_${index}`}
                        value={member.full_name}
                        onChange={(e) =>
                          handleInputChange(index, "full_name", e.target.value)
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`gender_${index}`}
                        className="text-sm font-medium"
                      >
                        Gender
                      </Label>
                      <Select
                        value={member.gender}
                        onValueChange={(value) =>
                          handleInputChange(index, "gender", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`residence_${index}`}
                        className="text-sm font-medium"
                      >
                        Residence
                      </Label>
                      <Input
                        id={`residence_${index}`}
                        value={member.residence}
                        onChange={(e) =>
                          handleInputChange(index, "residence", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`phone_${index}`}
                        className="text-sm font-medium"
                      >
                        Phone
                      </Label>
                      <Input
                        id={`phone_${index}`}
                        value={member.phone}
                        onChange={(e) =>
                          handleInputChange(index, "phone", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`email_${index}`}
                        className="text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id={`email_${index}`}
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          handleInputChange(index, "email", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`cell_${index}`}
                        className="text-sm font-medium"
                      >
                        Cell
                      </Label>
                      <Select
                        value={member.cell_id}
                        onValueChange={(value) =>
                          handleInputChange(index, "cell_id", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
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
                  </div>

                  {member.cell_id && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor={`fold_${index}`}
                          className="text-sm font-medium"
                        >
                          Fold
                        </Label>
                        <Select
                          value={member.fold_id}
                          onValueChange={(value) =>
                            handleInputChange(index, "fold_id", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select fold" />
                          </SelectTrigger>
                          <SelectContent>
                            {(foldsByCell[member.cell_id] || []).map((fold) => (
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
                      <div>
                        <Label
                          htmlFor={`status_${index}`}
                          className="text-sm font-medium"
                        >
                          Status
                        </Label>
                        <Select
                          value={member.membership_status}
                          onValueChange={(value) =>
                            handleInputChange(index, "membership_status", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Associate">Associate</SelectItem>
                            <SelectItem value="FirstTimer">
                              First Timer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!editingMember && (
            <Button
              type="button"
              variant="outline"
              onClick={addMemberRow}
              className="w-full mb-4 bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Member
            </Button>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingMember
                ? "Update Member"
                : `Add ${members.length} Member${
                    members.length > 1 ? "s" : ""
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
