import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Import Badge for roles
import { Modal } from "@/components/ui/modal";

import { Trash2, Edit } from "lucide-react";

const UserManagement = () => {
  // State for the "Create New User" form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("usher");
  const [assigned_cell_id, setAssigned_cell_id] = useState("");
  const [cells, setCells] = useState([]);

  // State for managing the edit form
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editAssignedCellId, setEditAssignedCellId] = useState("");

  // State for the list of all users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users and cells when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, cellsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/cells"),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }

        if (cellsRes.ok) {
          const cellsData = await cellsRes.json();
          setCells(cellsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle creating a new user (this function remains the same)
  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // ... (your existing handleSubmit logic for POST)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          assigned_cell_id: role === "cell_leader" ? assigned_cell_id : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Error: ${data.error}`);
      } else {
        alert(`Success: ${data.message}`);
        // Refetch users to show the new one
        const usersRes = await fetch("/api/users");
        if (usersRes.ok) setUsers(await usersRes.json());
        // Reset form
        setEmail("");
        setPassword("");
        setRole("usher");
        setAssigned_cell_id("");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
      console.error("Submission error:", error);
    }
  };

  // Handle deleting a user
  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Error: ${data.error}`);
      } else {
        alert(`Success: ${data.message}`);
        // Remove user from the state to update UI immediately
        setUsers(users.filter((u: any) => u.user_id !== userId));
      }
    } catch (error) {
      alert("An unexpected error occurred.");
      console.error("Deletion error:", error);
    }
  };
  // Function to open the edit form and pre-fill it
  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditAssignedCellId(user.assigned_cell_id || "");
  };

  // Function to submit the edit form
  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          role: editRole,
          assigned_cell_id:
            editRole === "cell_leader" ? editAssignedCellId : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Error: ${data.error}`);
      } else {
        alert(`Success: ${data.message}`);
        // Close the edit form
        setEditingUser(null);
        // Refetch users to show the updated one
        const usersRes = await fetch("/api/users");
        if (usersRes.ok) setUsers(await usersRes.json());
      }
    } catch (error) {
      alert("An unexpected error occurred.");
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-8">
      {/* List of existing users */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage existing user accounts.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create User
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {users.map((user: any) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{user.role}</Badge>
                    {user.cell_name && (
                      <Badge variant="outline">{user.cell_name}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form to create a new user */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>
            Add a new user to the ministry system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Create User Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          >
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <h2 className="text-xl font-bold">Create New User</h2>
              <p className="text-sm text-muted-foreground">
                Add a new user to the ministry system.
              </p>
              <div>
                <label htmlFor="create-email">Email</label>
                <Input
                  id="create-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="create-password">Password</label>
                <Input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="create-role">Role</label>
                <select
                  id="create-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="usher">Usher</option>
                  <option value="cell_leader">Cell Leader</option>
                  <option value="finance_leader">Finance Leader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {role === "cell_leader" && (
                <div>
                  <label htmlFor="create-assigned_cell_id">
                    Assign to Cell
                  </label>
                  <select
                    id="create-assigned_cell_id"
                    value={assigned_cell_id}
                    onChange={(e) => setAssigned_cell_id(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a cell</option>
                    {cells.map((cell: any) => (
                      <option key={cell.cell_id} value={cell.cell_id}>
                        {cell.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </Modal>
        </CardContent>
      </Card>
      {/* Edit User Form - shown conditionally */}
      {editingUser && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              Update the details for {editingUser.email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Edit User Modal */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)}>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <h2 className="text-xl font-bold">Edit User</h2>
                <p className="text-sm text-muted-foreground">
                  Update the details for {editingUser?.email}.
                </p>
                <div>
                  <label htmlFor="edit-email">Email</label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-role">Role</label>
                  <select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="usher">Usher</option>
                    <option value="cell_leader">Cell Leader</option>
                    <option value="finance_leader">Finance Leader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editRole === "cell_leader" && (
                  <div>
                    <label htmlFor="edit-assigned_cell_id">
                      Assign to Cell
                    </label>
                    <select
                      id="edit-assigned_cell_id"
                      value={editAssignedCellId}
                      onChange={(e) => setEditAssignedCellId(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select a cell</option>
                      {cells.map((cell: any) => (
                        <option key={cell.cell_id} value={cell.cell_id}>
                          {cell.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Modal>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
