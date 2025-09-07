import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  Calendar,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved';
  latitude: number;
  longitude: number;
  address: string;
  image_url?: string;
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (issueId: string) => void;
  onComment?: (issueId: string) => void;
  showLocation?: boolean;
}

const categoryLabels: Record<string, string> = {
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

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  in_progress: "bg-primary text-primary-foreground",
  resolved: "bg-success text-success-foreground"
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress", 
  resolved: "Resolved"
};

export function IssueCard({ 
  issue, 
  onUpvote, 
  onComment, 
  showLocation = true 
}: IssueCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkUpvoteStatus(user.id);
      }
    });
  }, [issue.id]);

  const checkUpvoteStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('user_id', userId)
        .eq('issue_id', issue.id)
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
        // Remove upvote
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issue.id);

        if (error) throw error;
        setHasUpvoted(false);
      } else {
        // Add upvote
        const { error } = await supabase
          .from('upvotes')
          .insert({
            user_id: user.id,
            issue_id: issue.id,
          });

        if (error) throw error;
        setHasUpvoted(true);
      }

      onUpvote?.(issue.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update upvote.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-civic transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[issue.category] || issue.category}
                </Badge>
                <Badge className={statusColors[issue.status]}>
                  {statusLabels[issue.status]}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg leading-tight">
                {issue.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground line-clamp-3">
            {issue.description}
          </p>

          {/* Image */}
          {issue.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={issue.image_url} 
                alt="Issue"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Location */}
          {showLocation && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{issue.address}</span>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{issue.profiles?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-6 px-6">
        <div className="flex items-center justify-between w-full">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => onComment?.(issue.id)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {issue.comments_count}
            </Button>
          </div>

          {showLocation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Open map view centered on this issue
                const mapUrl = `https://maps.google.com/maps?q=${issue.latitude},${issue.longitude}`;
                window.open(mapUrl, '_blank');
              }}
            >
              View on Map
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}