import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IssueCategories from "@/components/IssueCategories";
import RecentReports from "@/components/RecentReports";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <IssueCategories />
      <RecentReports />
      <Footer />
    </div>
  );
};

export default Index;
