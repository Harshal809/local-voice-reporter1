// AdminPanel.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IssueCard } from "@/components/issues/IssueCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  FileDown,
} from "lucide-react";

type Profile = {
  user_id: string;
  full_name?: string | null;
  role?: "admin" | "user" | string;
  [k: string]: any;
};

type Issue = {
  id: string;
  title: string;
  description?: string | null;
  address?: string | null;
  status: "pending" | "in_progress" | "resolved" | string;
  created_at?: string;
  user_id?: string | null;
  profiles?: { full_name?: string | null } | null;
  [k: string]: any;
};

const PAGE_SIZE = 12;

const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  // debounce searchTerm -> debouncedSearch
  const searchTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0); // reset page on search change
    }, 350);

    return () => {
      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  // auth check on mount
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      checkAdminAccess(user.id);
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const checkAdminAccess = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      if (!profileData || profileData.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      setProfile(profileData);
    } catch (err) {
      console.error("Error checking admin access:", err);
      navigate("/dashboard");
    }
  };

  // Build and run query
  const fetchIssues = useCallback(
    async (opts?: { append?: boolean }) => {
      if (!profile) return;
      try {
        setLoading(true);
        const offset = page * PAGE_SIZE;
        // Start base query; join profile display name
        let query = supabase
          .from("issues")
          .select(
            `
            *,
            profiles:user_id (full_name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(PAGE_SIZE)
          .offset(offset);

        // filter by status if needed
        if (statusFilter && statusFilter !== "all") {
          query = query.eq("status", statusFilter as any);
        }

        // server-side search (title || description || address)
        if (debouncedSearch) {
          // use OR'ed ilike conditions
          const term = `%${debouncedSearch.replace(/%/g, "")}%`;
          // Supabase .or expects a string like: 'title.ilike.%term%,description.ilike.%term%'
          query = query.or(
            `title.ilike.${term},description.ilike.${term},address.ilike.${term}`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        const newData = (data || []) as Issue[];

        setHasMore(newData.length === PAGE_SIZE);
        setIssues((prev) => (opts?.append ? [...prev, ...newData] : newData));
      } catch (err: any) {
        console.error("Error fetching issues:", err);
        toast({
          title: "Unable to load issues",
          description: err?.message || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, page, profile, statusFilter, toast]
  );

  // initial fetch + when filters change
  useEffect(() => {
    if (profile && profile.role === "admin") {
      fetchIssues({ append: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, debouncedSearch, statusFilter, page]);

  // realtime subscription for issues table to keep admin view fresh
  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    // subscribe using legacy API (widely supported)
    const subscription = supabase
      .from("issues")
      .on("*", (payload) => {
        // For simplicity, on any change: refetch first page (or depending on payload we could update more granularly)
        // Keep it light: only refetch if the changed row would match current filters/search
        const row = payload.new ?? payload.old;
        // quick heuristic: if no row, refetch
        if (!row) {
          fetchIssues({ append: false });
          return;
        }

        // If search term present and row doesn't match, skip refetch
        const matchesSearch =
          !debouncedSearch ||
          (row.title && row.title.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (row.description &&
            row.description.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (row.address && row.address.toLowerCase().includes(debouncedSearch.toLowerCase()));

        const matchesStatus = statusFilter === "all" || row.status === statusFilter;

        if (matchesSearch && matchesStatus) {
          // re-fetch page 0 for consistency
          setPage(0);
          fetchIssues({ append: false });
        }
      })
      .subscribe();

    return () => {
      // remove subscription
      // @ts-ignore - removeSubscription exists in many client versions
      if (subscription && (supabase as any).removeSubscription) {
        // older clients
        // @ts-ignore
        supabase.removeSubscription(subscription);
      } else if (subscription && (subscription as any).unsubscribe) {
        // newer channel-style object may expose unsubscribe
        try {
          // @ts-ignore
          subscription.unsubscribe();
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, debouncedSearch, statusFilter]);

  // Optimistic status update
  const updateIssueStatus = useCallback(
    async (issueId: string, newStatus: string) => {
      const prev = issues;
      // optimistic update locally
      setIssues((cur) => cur.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
      try {
        const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", issueId);
        if (error) throw error;
        toast({
          title: "Status updated",
          description: `Issue status changed to ${newStatus.replace("_", " ")}.`,
        });
      } catch (err: any) {
        // revert
        setIssues(prev);
        console.error("Error updating status:", err);
        toast({
          title: "Error updating status",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
    [issues, toast]
  );

  // Bulk actions
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const bulkMarkResolved = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast({ title: "No issues selected", description: "Select at least one issue." });
      return;
    }
    // optimistic update
    const prev = issues;
    setIssues((cur) => cur.map((i) => (selectedIds.includes(i.id) ? { ...i, status: "resolved" } : i)));
    try {
      const { error } = await supabase.from("issues").update({ status: "resolved" }).in("id", selectedIds);
      if (error) throw error;
      toast({
        title: "Bulk update complete",
        description: `${selectedIds.length} issue(s) marked resolved.`,
      });
      setSelected({});
    } catch (err: any) {
      setIssues(prev);
      console.error("Bulk update error:", err);
      toast({
        title: "Bulk update failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedIds, issues, toast]);

  // Export CSV of current visible issues
  const exportCSV = useCallback(() => {
    const rows = issues.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description ?? "",
      address: i.address ?? "",
      status: i.status,
      created_at: i.created_at ?? "",
      reported_by: i.profiles?.full_name ?? i.user_id ?? "",
    }));
    const header = Object.keys(rows[0] || {});
    const csv = [
      header.join(","),
      ...rows.map((r) => header.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `issues_export_${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [issues]);

  // derived & client-side fallback filtering (defensive)
  const filteredIssues = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return issues.filter((issue) => {
      const t = issue.title?.toLowerCase() ?? "";
      const d = issue.description?.toLowerCase() ?? "";
      const a = issue.address?.toLowerCase() ?? "";
      const matchesTerm = !term || t.includes(term) || d.includes(term) || a.includes(term);
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [issues, debouncedSearch, statusFilter]);

  if (!profile || profile.role !== "admin") {
    // while check runs, show nothing (redirect handled elsewhere)
    return null;
  }

  const stats = useMemo(
    () => ({
      total: issues.length,
      pending: issues.filter((issue) => issue.status === "pending").length,
      inProgress: issues.filter((issue) => issue.status === "in_progress").length,
      resolved: issues.filter((issue) => issue.status === "resolved").length,
    }),
    [issues]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Manage and track all civic issues across the platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={() => { setSelected({}); setPage(0); fetchIssues({ append: false }); }}>
            Refresh
          </Button>
          <Button size="sm" onClick={exportCSV} leftIcon={<FileDown />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(0); }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions & count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === filteredIssues.length}
              onChange={(e) => {
                if (e.target.checked) {
                  const newSelected: Record<string, boolean> = {};
                  filteredIssues.forEach((i) => (newSelected[i.id] = true));
                  setSelected(newSelected);
                } else {
                  setSelected({});
                }
              }}
            />
            <span>Select all visible</span>
          </label>

          <Button size="sm" variant="outline" onClick={() => setSelected({})}>
            Clear selection
          </Button>

          <Button size="sm" onClick={bulkMarkResolved} disabled={selectedIds.length === 0}>
            Mark {selectedIds.length} Resolved
          </Button>
        </div>

        <Badge variant="outline" className="text-sm">
          {filteredIssues.length} visible
        </Badge>
      </div>

      {/* Issues Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Issues</h2>
          <div className="text-sm text-muted-foreground">Page {page + 1}</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-32 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <Card>
            <CardContent>
              <div className="py-6 text-center text-muted-foreground">No issues found.</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="shadow-card hover:shadow-civic transition-shadow">
                <div className="flex items-start justify-between p-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selected[issue.id]}
                      onChange={(e) => setSelected((s) => ({ ...s, [issue.id]: e.target.checked }))}
                    />
                  </label>
                </div>

                <IssueCard
                  issue={issue}
                  onUpvote={() => fetchIssues({ append: false })}
                  onComment={(issueId) => navigate(`/issues/${issueId}`)}
                />

                {/* Admin Actions */}
                <CardContent className="pt-0 pb-4 px-6">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Admin Actions:</span>
                      <div className="flex gap-2">
                        {issue.status !== "in_progress" && (
                          <Button size="sm" variant="outline" onClick={() => updateIssueStatus(issue.id, "in_progress")}>
                            Start Work
                          </Button>
                        )}
                        {issue.status !== "resolved" && (
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => updateIssueStatus(issue.id, "resolved")}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {issue.status === "resolved" && (
                          <Button size="sm" variant="outline" onClick={() => updateIssueStatus(issue.id, "pending")}>
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (page > 0) setPage((p) => p - 1);
            }}
            disabled={page === 0}
          >
            Previous
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (hasMore) setPage((p) => p + 1);
            }}
            disabled={!hasMore}
          >
            Load more
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
