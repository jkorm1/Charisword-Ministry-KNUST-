// components/members/member-table.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";

interface Member {
  member_id: number;
  full_name: string;
  gender: string;
  phone?: string;
  email?: string;
  cell_name?: string;
  membership_status: string;
  date_joined: string;
}

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member_id: number) => void;
}

export function MemberTable({ members, onEdit, onDelete }: MemberTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Cell</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.member_id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.gender}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {member.phone && <p className="text-sm">{member.phone}</p>}
                  {member.email && (
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{member.cell_name || "Unassigned"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    member.membership_status === "Member"
                      ? "default"
                      : "secondary"
                  }
                >
                  {member.membership_status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(member.date_joined).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("[v0] Delete clicked for member:", member);
                      console.log("[v0] member.member_id:", member.member_id);
                      console.log("[v0] All member keys:", Object.keys(member));
                      onDelete(member.member_id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
