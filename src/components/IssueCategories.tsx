import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = [
  {
    title: "Sadak ki Kharabi",
    description: "Tute hue roads, potholes, aur construction issues",
    icon: "🛣️",
    color: "bg-red-50 border-red-200 hover:bg-red-100"
  },
  {
    title: "Street Lights",
    description: "Band lights, tube light issues, dark areas",
    icon: "💡",
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
  },
  {
    title: "Safai Samasya",
    description: "Kachra jama, drainage block, gandagi",
    icon: "🗑️",
    color: "bg-green-50 border-green-200 hover:bg-green-100"
  },
  {
    title: "Paani ki Samasya",
    description: "Water leakage, pipe burst, supply issues",
    icon: "💧",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
  },
  {
    title: "Electricity",
    description: "Power cuts, transformer issues, cable problems",
    icon: "⚡",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
  },
  {
    title: "Other Issues",
    description: "Koi aur civic problem? Yahan report kariye",
    icon: "📋",
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100"
  }
];

const IssueCategories = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Kya Samasya Hai?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Apni samasya ka category choose kariye aur detail mein report kariye
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className={`${category.color} transition-all duration-300 hover:shadow-card-civic cursor-pointer group`}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <CardTitle className="text-xl text-foreground">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {category.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                >
                  Report Kariye
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IssueCategories;