"use client";
import { Button } from "@/components/ui/button";
import { Github, MessageCircle, Heart, Zap } from "lucide-react";
import {
  FaLinkedin,
  FaSquareXTwitter,
  FaSquareInstagram,
  FaTelegram,
  FaSquareYoutube,
} from "react-icons/fa6";
import { BsShieldCheck } from "react-icons/bs";
import { MdVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

 const Footer = () => {
  const navigate = useNavigate();
  const router = {
    push: (to: string) => {
      if (/^https?:\/\//i.test(to)) {
        window.open(to, "_blank", "noopener,noreferrer");
      } else {
        navigate(to);
      }
    },
  };
  const [loading, setLoading] = useState(true);

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden py-8 sm:py-12">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-muted/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-6 border-t border-border">
          <div>
            <div className="flex items-center gap-1 text-xl sm:text-sm text-muted-foreground mb-4 sm:mb-0 text-center sm:text-left">
              <span>
                <img src="/favicon.ico" alt="" />
              </span>{" "} <h1 className="text-3xl font-serif font-bold">CivicPluse </h1> 
              <span className="text-sm text-gray-400 ml-2">v1.0.0</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 justify-center md:justify-start">
              Made with {" "}
              <Heart className="w-3 sm:w-4 h-3 sm:h-4 text-red-500 fill-current animate-pulse transition-transform duration-300 ease-in-out" />
              <span>by CivilPluse Team </span>
            </div>
            {/* Trust Badges */}
            <div className="mt-6 items-center gap-y-6  justify-center md:justify-start">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <BsShieldCheck className="text-blue-400 mr-1 text-2xl py-0.5" />
                <span>More Than 1000+ Users and Reliable </span>
        </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">

                <MdVisibility className="text-blue-400 mr-1 text-2xl py-0.5" />
                <span>24*7 Monitoring & Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
        
            <div className="flex flex-col gap-4 ">
              <h2 className="text-xl font-bold relative inline-block pb-2">
                Quick Links

              </h2>
              <ul className="space-y-3 text-center justify-center items-center md:text-left">
                {[
                  { name: "Home", path: "/" },
                  { name: "About", path: "/about" },
                  { name: "Contact", path: "/contact" },
                  { name: "Feature", path: "/feature" },
                ].map((link, idx) => (
                  <li key={idx} className="group">
                    <a
                      href={link.path}
                      className="text-gray-400 hover:text-blue-400 hover:font-medium transition-all duration-300 flex items-center group-hover:translate-x-1"
                    >
                      <span className="absolute bottom-0 left-0 w-full inline-block h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
              </div>   
          {/* Resources Links */}
           <div className="pb-12 flex flex-col gap-4 justify-center items-center text-center md:items-start sm:pr-2 md:pr-20 ">
            <div className="text-xl font-bold relative inline-block pb-2"></div>
              <h2 className="text-xl md:text-left font-bold relative inline-block pb-2">
                Resources
              </h2>
              <ul className="space-y-3 text-center">
                {[
                  { name: "Dashboard", path: "/auth" },
                  { name: "How It Works", path: "/auth" },
                  { name: "Report an Issues", path: "/auth" },
                  { name: "Join Our Community", path: "/" },
                ].map((link, idx) => (
                  <li key={idx} className="group">
                    <a
                      href={link.path}
                      className="text-gray-400 hover:text-blue-400 hover:font-medium transition-all duration-300 flex items-center group-hover:translate-x-1"
                    >
                      {/* <span className="absolute bottom-0 left-0 w-full inline-block h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      {link.name} */}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            </div>
            </div>
      
      {/* Social Media Icons */}
      <div className="mx-auto px-4 flex flex-col items-center justify-center border-gray-400 pt-4">
        <div className="w-full max-w-md flex justify-around items-center space-x-4 px-2 py-1 ">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer transform hover:scale-[1.3] transition-transform duration-300 ease-in-out "
            onClick={() =>
              router.push("https://github.com/Harshal809/local-voice-reporter1")
            }
          >
            <Github className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer transform hover:scale-[1.4] transition-transform duration-300 ease-in-out "
            onClick={() => router.push("https://x.com/...")}
          >
            <FaSquareXTwitter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer transform hover:scale-[1.4] transition-transform duration-300 ease-in-out hover:text-blue-400"
            onClick={() => router.push("https://www.linkedin.com/in/")}
          >
            <FaLinkedin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out  hover:text-pink-500 hover:from-pink-500 hover:to-yellow-500"
            onClick={() => router.push("https://www.instagram.com/")}
          >
            <FaSquareInstagram className="w-4 h-4" />
          </Button>
           
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out"
            onClick={() => router.push("https://discord.com/invite/...")}
          >
            <Zap className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer  transform hover:scale-[1.5] transition-transform duration-300 ease-in-out hover:text-sky-400"
            onClick={() => router.push("https://t.me/")}
          >
            <FaTelegram className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out hover:text-red-900"
            onClick={() => router.push("https://www.youtube.com/")}
          >
            <FaSquareYoutube className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Copyright */}
       
             <div className="text-center pt-4 mt-2 border-t border-border  text-gray-400">
          &copy; {new Date().getFullYear()}{"  "}
          <b className="font-extrabold font-sans">CivilPlus. </b> All rights
          reserved.
        </div>
        <div className="text-center text-lg pt-1 mt-1  text-gray-400">
        <h2>
          Developed by CivilPlus Team with ❤️ in India
        </h2>
       </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">

          <div className="flex justify-end pr-5 items-center gap-6 mt-2">
            <span
              className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"
              onClick={() => router.push("#")}
            >
              Privacy
            </span>
            <span
              className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"
              onClick={() => router.push("#")}
            >
              Terms
            </span>
            <span
              className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"
              onClick={() => router.push("#")}
            >
              Policy
            </span>
            
          </div>
          </div>
    </footer>
  );
};


export default Footer;
