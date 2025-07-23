import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentReports = [
  {
    id: "CP001",
    title: "Main Road Pothole",
    location: "Sector 15, Delhi",
    status: "In Progress",
    time: "2 hours ago",
    category: "Road",
    statusColor: "bg-yellow-500"
  },
  {
    id: "CP002", 
    title: "Street Light Not Working",
    location: "Park Street, Mumbai",
    status: "Resolved",
    time: "5 hours ago",
    category: "Electricity",
    statusColor: "bg-green-500"
  },
  {
    id: "CP003",
    title: "Drainage Overflow",
    location: "Colony Road, Pune",
    status: "Reported",
    time: "1 day ago",
    category: "Drainage",
    statusColor: "bg-red-500"
  },
  {
    id: "CP004",
    title: "Water Pipe Leakage", 
    location: "Housing Society, Bangalore",
    status: "In Progress",
    time: "2 days ago",
    category: "Water",
    statusColor: "bg-yellow-500"
  }
];

const RecentReports = () => {
  return (
    <section className="py-16 bg-civic-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Haal Hi Ke Reports
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dekh sakte hai ki aur logo ne kya problems report ki hai aur unka status kya hai
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {recentReports.map((report) => (
            <Card key={report.id} className="bg-background shadow-card-civic hover:shadow-civic transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">
                    {report.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    #{report.id}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  📍 {report.location}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${report.statusColor}`}></div>
                    <span className="text-sm font-medium text-foreground">
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span className="bg-accent px-2 py-1 rounded-full">
                      {report.category}
                    </span>
                    <span>{report.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button className="text-primary hover:text-secondary font-medium underline">
            Sabhi Reports Dekhiye →
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentReports;