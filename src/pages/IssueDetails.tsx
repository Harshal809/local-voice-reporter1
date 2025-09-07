import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  Calendar,
  User,
  Send,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (id) {
        fetchIssue();
        fetchComments();
        if (user) {
          checkUpvoteStatus(user.id);
        }
      }
    });
  }, [id]);

  const fetchIssue = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setIssue(data);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast({
        title: "Error",
        description: "Failed to load issue details.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('issue_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkUpvoteStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('user_id', userId)
        .eq('issue_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHasUpvoted(!!data);
    } catch (error) {
      console.error('Error checking upvote status:', error);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upvote issues.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (hasUpvoted) {
        await supabase
          .from('upvotes')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', id);
        setHasUpvoted(false);
      } else {
        await supabase
          .from('upvotes')
          .insert({
            user_id: user.id,
            issue_id: id,
          });
        setHasUpvoted(true);
      }
      
      fetchIssue(); // Refresh to get updated upvote count
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update upvote.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setCommentLoading(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          issue_id: id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      fetchIssue(); // Refresh to get updated comment count

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Issue Not Found</h1>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const categoryLabels = {
    road_damage: "Road Damage",
    streetlight: "Streetlight",
    garbage: "Garbage Collection",
    water_leak: "Water Leak",
    sewage: "Sewage",
    sidewalk: "Sidewalk",
    traffic_signal: "Traffic Signal",
    noise: "Noise Issue",
    graffiti: "Graffiti",
    other: "Other"
  };

  const statusColors = {
    pending: "bg-warning text-warning-foreground",
    in_progress: "bg-primary text-primary-foreground",
    resolved: "bg-success text-success-foreground"
  };

  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    resolved: "Resolved"
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Issues
      </Button>

      {/* Issue Details */}
      <Card className="shadow-civic">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  {categoryLabels[issue.category] || issue.category}
                </Badge>
                <Badge className={statusColors[issue.status]}>
                  {statusLabels[issue.status]}
                </Badge>
              </div>
              <CardTitle className="text-2xl leading-tight">
                {issue.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {issue.description}
            </p>
          </div>

          {/* Image */}
          {issue.image_url && (
            <div className="space-y-2">
              <h3 className="font-semibold">Photo</h3>
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={issue.image_url} 
                  alt="Issue"
                  className="w-full max-w-lg h-auto"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <h3 className="font-semibold">Location</h3>
            <div className="flex items-start space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{issue.address}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const mapUrl = `https://maps.google.com/maps?q=${issue.latitude},${issue.longitude}`;
                window.open(mapUrl, '_blank');
              }}
            >
              View on Map
            </Button>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{issue.profiles?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="sm"
                onClick={handleUpvote}
                className={hasUpvoted ? "bg-primary hover:bg-primary/90" : ""}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {issue.upvotes_count}
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                {issue.comments_count}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add Comment */}
          {user && (
            <div className="space-y-3">
              <Textarea
                placeholder="Add your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {commentLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Add Comment
              </Button>
            </div>
          )}

          {!user && (
            <div className="text-center py-4 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">
                Sign in to join the conversation
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-4 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {comment.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {comment.profiles?.full_name || 'Anonymous User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetails;