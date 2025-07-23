const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <h3 className="text-xl font-bold">CivicPulse</h3>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Apke sheher ki samasya ka digital solution. 
              Har citizen ki awaz, har problem ka hall.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-secondary transition-colors">Report Issue</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Track Status</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Recent Reports</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Guidelines</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-secondary transition-colors">Roads</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Street Lights</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Water Issues</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Cleanliness</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>📧 support@civicpulse.in</li>
              <li>📞 1800-CIVIC-HELP</li>
              <li>🕐 24/7 Available</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2024 CivicPulse. Made with ❤️ for better cities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;