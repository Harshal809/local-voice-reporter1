import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssueCard } from "@/components/issues/IssueCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      fetchMyIssues(user.id);
    });
  }, [navigate]);

  const fetchMyIssues = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyIssues(data || []);
    } catch (error) {
      console.error('Error fetching my issues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  const myStats = {
    total: myIssues.length,
    pending: myIssues.filter(issue => issue.status === 'pending').length,
    inProgress: myIssues.filter(issue => issue.status === 'in_progress').length,
    resolved: myIssues.filter(issue => issue.status === 'resolved').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your reported issues and their progress
          </p>
        </div>
        <Button
          onClick={() => navigate('/report')}
          className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-civic"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report New Issue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reports</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myStats.total}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{myStats.pending}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-civic transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{myStats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Issues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Issues</h2>
          <Badge variant="outline" className="text-sm">
            {myIssues.length} total
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-32 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : myIssues.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Issues Reported Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start making a difference in your community by reporting your first issue.
              </p>
              <Button onClick={() => navigate('/report')}>
                Report Your First Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={() => fetchMyIssues(user.id)}
                onComment={(issueId) => navigate(`/issues/${issueId}`)}
                showLocation={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;