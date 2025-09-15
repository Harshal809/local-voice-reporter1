import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Mail } from 'lucide-react';

const contactSchema = z.object({
  from_name: z.string().min(2, "Name must be at least 2 characters"),
  from_email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  category: z.enum(["Roads", "Street Lights", "Water Issues", "Cleanliness", "Other"]),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  image_url: z.string().url().optional().or(z.literal(""))
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      from_name: "",
      from_email: "",
      phone: "",
      location: "",
      category: "Other",
      subject: "",
      message: "",
      image_url: ""
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    const loadingToast = toast.loading("Sending your civic report...", {
      description: "Please wait while we process your submission."
    });
    
    try {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    
      const templateParams = {
        ...data,
        phone: data.phone || "Not provided",
        location: data.location || "Not specified", 
        image_url: data.image_url || "No image provided",
        report_time: new Date().toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.dismiss(loadingToast);
      toast.success("Report Submitted Successfully! 🏛️", {
        description: "Your civic issue has been reported. We'll review and forward it to relevant authorities within 24-48 hours.",
        duration: 6000,
      });

      form.reset();
      
    } catch (error) {

      console.error('EmailJS error:', error);
      
      toast.dismiss(loadingToast);
      toast.error("Submission Failed", {
        description: "Unable to send your report. Please check your internet connection and try again.",
        duration: 8000,
        action: {
          label: "Retry",
          onClick: () => form.handleSubmit(onSubmit)()
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-civic border-0">
            <CardHeader className="text-center pb-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">CP</span>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Contact Us
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-muted-foreground">
                <strong>Local Voice Reporter</strong> - Apke sheher ki samasya ka digital solution. 
                Report civic issues like potholes, streetlight failures, water leaks, and garbage collection 
                to connect citizens with authorities for responsive and transparent cities.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8">
              <Form {...form}>
                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="from_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              className="border-input focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="from_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              className="border-input focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+91-XXXXXXXXXX" 
                              className="border-input focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Area / Ward / City" 
                              className="border-input focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Issue Category *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="border-input focus:ring-primary">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Roads">🚧 Roads & Potholes</SelectItem>
                                <SelectItem value="Street Lights">💡 Street Lights</SelectItem>
                                <SelectItem value="Water Issues">💧 Water Issues</SelectItem>
                                <SelectItem value="Cleanliness">🧹 Cleanliness & Garbage</SelectItem>
                                <SelectItem value="Other">📋 Other Issues</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Issue Subject *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief issue summary" 
                              className="border-input focus:ring-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Detailed Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the civic issue in detail. Include specific location, time when noticed, and how it affects the community. Be as detailed as possible to help authorities understand and address the issue quickly."
                            rows={6}
                            className="resize-none border-input focus:ring-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide specific details like exact location, duration of the issue, and community impact.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Reference Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            className="border-input focus:ring-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Upload your image to any service (Google Drive, Dropbox, etc.) and paste the public link here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold py-3 transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Report...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Civic Report
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-muted-foreground">
            <p className="text-sm flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Your reports help make our cities more responsive and transparent. 
              Thank you for being an active citizen! 🏛️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
