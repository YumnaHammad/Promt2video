"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Users, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { UserRole } from "@/generated/prisma/client";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  onboardingDone: boolean;
  createdAt: string;
  subscription: { plan: string; status: string } | null;
  _count: { videos: number; projects: number };
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchUsers(search: string, role: string): Promise<UsersResponse> {
  const params = new URLSearchParams({ limit: "50" });
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  const res = await fetch(`/api/admin/users?${params}`);
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

function roleBadge(role: UserRole) {
  const styles: Record<UserRole, string> = {
    SUPER_ADMIN: "bg-amber-500/15 text-amber-400",
    ADMIN: "bg-violet-500/15 text-violet-400",
    USER: "bg-muted text-muted-foreground",
  };
  return styles[role];
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", search, roleFilter],
    queryFn: () => fetchUsers(search, roleFilter),
  });

  const updateRole = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User role updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const roles: { value: string; label: string }[] = [
    { value: "", label: "All roles" },
    { value: "USER", label: "User" },
    { value: "ADMIN", label: "Admin" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <div>
        <h1 className="text-fluid-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage accounts, roles, and subscription status.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                {data?.total ?? 0} total users
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search email or name..."
                  className="w-full pl-9 sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background/50 px-3 text-sm backdrop-blur-sm"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Videos</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  data?.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/30 transition-colors hover:bg-accent/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              (user.name?.[0] ?? user.email[0]).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {user.name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge(user.role)}`}
                        >
                          {user.role === "ADMIN" ||
                          user.role === "SUPER_ADMIN" ? (
                            <Shield className="h-3 w-3" />
                          ) : null}
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-muted-foreground">
                          {user.subscription?.plan ?? "FREE"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user._count.videos}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={updateRole.isPending}
                          onChange={(e) =>
                            updateRole.mutate({
                              userId: user.id,
                              role: e.target.value as UserRole,
                            })
                          }
                          className="h-8 rounded-md border border-border bg-background/50 px-2 text-xs"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
