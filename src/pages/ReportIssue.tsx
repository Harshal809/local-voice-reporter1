import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Camera, Upload } from "lucide-react";

const ReportIssue = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "", 
    category: "",
    latitude: "",
    longitude: "",
    address: "",
    image: null as File | null,
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    });
  }, [navigate]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbG00ZGRsd3QwMDI0M2xuenFmeGpoYTI0In0.rtAs4U4mPrO0J9oMKsrhAA&types=address`
          );
          const data = await response.json();
          const address = data.features?.[0]?.place_name || `${latitude}, ${longitude}`;
          
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address,
          }));
        } catch (error) {
          console.error('Error getting address:', error);
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: `${latitude}, ${longitude}`,
          }));
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "Location access denied",
          description: "Please enter your address manually or enable location access.",
          variant: "destructive",
        });
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('issue-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('issue-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report an issue.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Location required",
        description: "Please set your location or enter an address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
        if (!imageUrl) {
          toast({
            title: "Image upload failed",
            description: "The issue will be reported without the image.",
          });
        }
      }

      const { error } = await supabase
        .from('issues')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category as any,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address,
          image_url: imageUrl,
        });

      if (error) throw error;

      toast({
        title: "Issue reported successfully!",
        description: "Thank you for helping improve your community.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error reporting issue",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-civic">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-primary" />
            Report a Civic Issue
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide more details about the issue..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road_damage">Road Damage</SelectItem>
                  <SelectItem value="streetlight">Streetlight</SelectItem>
                  <SelectItem value="garbage">Garbage Collection</SelectItem>
                  <SelectItem value="water_leak">Water Leak</SelectItem>
                  <SelectItem value="sewage">Sewage</SelectItem>
                  <SelectItem value="sidewalk">Sidewalk</SelectItem>
                  <SelectItem value="traffic_signal">Traffic Signal</SelectItem>
                  <SelectItem value="noise">Noise Issue</SelectItem>
                  <SelectItem value="graffiti">Graffiti</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Location *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-3" />
                  )}
                  {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g. 40.7128"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    type="number"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g. -74.0060"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address or description"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Photo (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Label
                  htmlFor="image"
                  className="flex items-center cursor-pointer px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {formData.image ? (
                    <Upload className="h-4 w-4 mr-2" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  {formData.image ? formData.image.name : 'Choose Photo'}
                </Label>
                {formData.image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Max file size: 5MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-civic"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Report Issue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssue;
