import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "lucide-react";

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔹 Verify user authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      checkAdminAccess(user.id);
    });
  }, [navigate]);

  // 🔹 Check if user is admin
  const checkAdminAccess = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (profile.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setProfile(profile);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    }
  };

  // 🔹 Fetch issues with optional filter
  const fetchAllIssues = useCallback(async () => {
    if (!profile || profile.role !== "admin") return;

    setLoading(true);
    try {
      let query = supabase
        .from("issues")
        .select(
          `
          *,
          profiles:user_id (full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;

      setIssues(data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, profile]);

  useEffect(() => {
    fetchAllIssues();
  }, [fetchAllIssues]);

  // 🔹 Update issue status
  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("issues")
        .update({ status: newStatus })
        .eq("id", issueId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Issue marked as ${newStatus.replace("_", " ")}.`,
      });

      fetchAllIssues();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile || profile.role !== "admin") {
    return null; // Redirect will handle it
  }

  // 🔹 Derived stats
  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter((i) => i.status === "pending").length,
      inProgress: issues.filter((i) => i.status === "in_progress").length,
      resolved: issues.filter((i) => i.status === "resolved").length,
    };
  }, [issues]);

  // 🔹 Filtered issues
  const filteredIssues = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.address.toLowerCase().includes(term)
    );
  }, [issues, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track all civic issues across the platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Issues" value={stats.total} icon={<Users />} />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<AlertTriangle className="text-warning" />}
          valueClass="text-warning"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<AlertTriangle className="text-primary" />}
          valueClass="text-primary"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="text-success" />}
          valueClass="text-success"
        />
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Issues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Issues</h2>
          <Badge variant="outline">{filteredIssues.length} issues</Badge>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <Card
                key={issue.id}
                className="shadow-card hover:shadow-civic transition-shadow"
              >
                <IssueCard
                  issue={issue}
                  onUpvote={fetchAllIssues}
                  onComment={(id) => navigate(`/issues/${id}`)}
                />
                <CardContent className="pt-0 pb-4 px-6 border-t mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Admin Actions:
                    </span>
                    <div className="flex gap-2">
                      {issue.status !== "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateIssueStatus(issue.id, "in_progress")
                          }
                        >
                          Start Work
                        </Button>
                      )}
                      {issue.status !== "resolved" && (
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() =>
                            updateIssueStatus(issue.id, "resolved")
                          }
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {issue.status === "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateIssueStatus(issue.id, "pending")
                          }
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* 🔹 Small Helper Components */
const StatCard = ({
  title,
  value,
  icon,
  valueClass = "text-primary",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueClass?: string;
}) => (
  <Card className="shadow-card hover:shadow-civic transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-8 bg-muted rounded"></div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default AdminPanel;
