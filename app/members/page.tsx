// app/members/page.tsx
"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MemberForm } from "@/components/members/member-form";
import { MemberTable } from "@/components/members/member-table";
import { MemberStats } from "@/components/members/member-stats";
import { MemberFilters } from "@/components/members/member-filters";

interface Member {
  member_id: number;
  full_name: string;
  gender: string;
  residence?: string;
  phone?: string;
  email?: string;
  cell_name?: string;
  fold_name?: string;
  inviter_name?: string;
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

function MembersContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCell, setSelectedCell] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [cells, setCells] = useState<Cell[]>([]);
  const [folds, setFolds] = useState<Fold[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch members whenever search term, cell, or status changes
  useEffect(() => {
    fetchMembers();
  }, [debouncedSearchTerm, selectedCell, filterStatus]);

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (selectedCell) params.append("cellId", selectedCell);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await fetch(`/api/members?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCells = async () => {
    try {
      const response = await fetch("/api/cells");
      if (response.ok) {
        const data = await response.json();
        setCells(data);
      }
    } catch (error) {
      console.error("Error fetching cells:", error);
    }
  };

  const fetchFolds = async (cellId: string) => {
    try {
      const response = await fetch(`/api/folds?cellId=${cellId}`);
      if (response.ok) {
        const data = await response.json();
        setFolds(data);
      }
    } catch (error) {
      console.error("Error fetching folds:", error);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchMembers();
      }
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const getFilteredAndSortedMembers = () => {
    let filtered = members.filter((member) => {
      if (filterStatus === "all") return true;
      return member.membership_status === filterStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.full_name.localeCompare(b.full_name);
        case "join_date":
          return (
            new Date(b.date_joined).getTime() -
            new Date(a.date_joined).getTime()
          );
        case "cell":
          return (a.cell_name || "").localeCompare(b.cell_name || "");
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredMembers = getFilteredAndSortedMembers();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-coffee mb-2">
            Members Management
          </h1>
          <p className="text-gray-600">Manage and view all church members</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Statistics Dashboard */}
      <MemberStats members={filteredMembers} />

      {/* Search and Filter Section */}
      <MemberFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCell={selectedCell} // Add this
        onCellChange={setSelectedCell} // Add this
        cells={cells} // Add this
      />

      {/* Members Table */}
      <MemberTable
        members={filteredMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Member Form Dialog */}
      <MemberForm
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingMember(null);
        }}
        onSave={fetchMembers}
        editingMember={editingMember}
        cells={cells}
        folds={folds}
      />

      {filteredMembers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No members found matching your criteria.
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "usher", "cell_leader"]}>
      <MembersContent />
    </ProtectedRoute>
  );
}
