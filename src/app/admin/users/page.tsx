"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Search } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string;
  classId: string;
  studentId: string;
  role: string;
  createdAt: string;
  profile?: {
    semester?: string;
    course?: string;
  };
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () =>
      apiFetch<{ success: true; users: AdminUser[] }>("/api/admin/users"),
    staleTime: 30_000,
  });

  const roleMutation = useMutation({
    mutationFn: (data: { userId: string; role: string }) =>
      apiFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const allUsers = usersQuery.data?.users || [];

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId.toLowerCase().includes(search.toLowerCase()) ||
      u.classId.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
          User Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all registered MySVGU users.
        </p>
      </div>

      <Card className="border-white/85 bg-white/88 dark:border-slate-700/50 dark:bg-slate-800/60">
        <CardHeader className="border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
              All users ({filteredUsers.length})
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-56 pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usersQuery.isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {isAdmin && <TableHead className="text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="font-mono text-xs">{u.studentId}</TableCell>
                      <TableCell className="font-mono text-xs">{u.classId}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {u.profile?.course || "-"}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          variant={
                            u.role === "ADMIN"
                              ? "coming"
                              : u.role === "FACULTY"
                                ? "progress"
                                : "live"
                          }
                        >
                          {u.role}
                        </StatusPill>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {u.id === currentUser?.id ? (
                            <span className="text-xs text-slate-400">You</span>
                          ) : (
                            <Select
                              value={u.role}
                              onValueChange={(newRole) =>
                                roleMutation.mutate({ userId: u.id, role: newRole })
                              }
                              disabled={roleMutation.isPending}
                            >
                              <SelectTrigger className="h-8 w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="FACULTY">Faculty</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              {search || roleFilter !== "ALL"
                ? "No users match the current filters."
                : "No users registered yet."}
            </p>
          )}

          {roleMutation.isError && (
            <div className="flex items-center gap-2 border-t p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              Failed to update role. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
