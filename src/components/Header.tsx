import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import ThemeToggle from "./ThemeToggle";


const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">🌞</span>
            <span className="text-xl font-semibold text-foreground">CivicPulse</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="#report" className="text-foreground hover:text-primary transition-colors">
            Report Issue
          </a>
          <a href="#status" className="text-foreground hover:text-primary transition-colors">
            Track Status
          </a>
          <Button variant="default" size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
