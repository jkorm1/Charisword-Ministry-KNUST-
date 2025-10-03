// components/members/member-filters.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedCell: string; // Add this
  onCellChange: (value: string) => void; // Add this
  cells: Cell[]; // Add this
}

export function MemberFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  selectedCell, // Add this
  onCellChange, // Add this
  cells, // Add this
}: MemberFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Search Members</label>
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="text-sm font-medium">Status</label>
            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Member">Members</SelectItem>
                <SelectItem value="Associate">Associates</SelectItem>
                <SelectItem value="FirstTimer">First Timers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium">Cell</label>
            <Select
              value={selectedCell || "all"}
              onValueChange={(value) =>
                onCellChange(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by cell" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cells</SelectItem>
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

          <div className="w-48">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="join_date">Join Date</SelectItem>
                <SelectItem value="cell">Cell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
