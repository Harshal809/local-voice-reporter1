import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-civic">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <MapPin className="h-16 w-16 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">404</h1>
            <h2 className="text-xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Button 
            onClick={() => window.location.href = "/"}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-civic"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
