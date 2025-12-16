import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Orbit Employ" className="h-10 w-auto brightness-0 invert" />
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
                <a href="mailto:support@orbitemploy.com" className="hover:text-secondary transition-colors">
                  support@orbitemploy.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-card/70">
                <Phone className="w-5 h-5 text-secondary" />
                <a href="tel:+256790331326" className="hover:text-secondary transition-colors">
                  0790331326
                </a>
              </li>
              <li className="flex items-center gap-3 text-card/70">
                <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <a href="https://wa.me/256790331326" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                  WhatsApp
                </a>
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
