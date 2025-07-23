import { Button } from "@/components/ui/button";
import heroImage from "@/assets/civic-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight">
                Apke Sheher Ki
                <span className="block text-secondary">Awaz Baniye</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Sadak ki kharabiya, street lights, safai ya paani ki samasya? 
                Turant report kariye aur solution paye.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-civic hover:shadow-lg transition-all duration-300"
              >
                Report Karte Rahiye
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-civic-light"
              >
                Status Check Kariye
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span>500+ Issues Resolved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>24/7 Active</span>
              </div>
            </div>
          </div>
          
          <div className="relative animate-slide-up">
            <img 
              src={heroImage}
              alt="Citizens reporting civic issues"
              className="rounded-2xl shadow-civic w-full h-auto"
            />
            <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Live Reports
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;