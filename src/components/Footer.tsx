import { Globe, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-secondary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-card">
                Orbit Employ
              </span>
            </div>
            <p className="text-card/70 max-w-md mb-6 leading-relaxed">
              Empowering East Africans for global opportunities. We connect skilled workers 
              from Uganda, Kenya, and Tanzania to verified employers across the Middle East.
            </p>
            <p className="text-secondary font-semibold">
              Next Recruitment Cycle: January 2025
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-card mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#process" className="text-card/70 hover:text-secondary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#apply" className="text-card/70 hover:text-secondary transition-colors">
                  Apply Now
                </a>
              </li>
              <li>
                <a href="#" className="text-card/70 hover:text-secondary transition-colors">
                  Eligibility
                </a>
              </li>
              <li>
                <a href="#" className="text-card/70 hover:text-secondary transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-card mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-card/70">
                <Mail className="w-5 h-5 text-secondary" />
                <span>info@orbitemploy.com</span>
              </li>
              <li className="flex items-center gap-3 text-card/70">
                <Phone className="w-5 h-5 text-secondary" />
                <span>+256 700 000 000</span>
              </li>
              <li className="flex items-start gap-3 text-card/70">
                <MapPin className="w-5 h-5 text-secondary mt-1" />
                <span>East Africa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-card/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-card/50 text-sm">
            © 2024 Orbit Employ. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-card/50 hover:text-secondary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-card/50 hover:text-secondary text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
