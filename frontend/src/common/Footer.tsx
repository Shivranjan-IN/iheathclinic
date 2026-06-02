import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Heart } from "lucide-react";
import { PageView } from './types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => onNavigate("home")}>
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">I Health Clinic</span>
            </div>
            <p className="text-sm mb-4">
              Your health, our priority. Digitally.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate("features")}
                  className="hover:text-pink-400 transition-colors"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button className="hover:text-pink-400 transition-colors">
                  API Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("contact")}
                  className="hover:text-pink-400 transition-colors"
                >
                  Support
                </button>
              </li>
              <li>
                <button className="hover:text-pink-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-pink-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("contact")}
                  className="hover:text-pink-400 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contact@ihealthclinic.com"
                  className="hover:text-pink-400 transition-colors"
                >
                  contact@ihealthclinic.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919998887777"
                  className="hover:text-pink-400 transition-colors"
                >
                  +91 999 888 7777
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white mb-4">Stay Updated</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="bg-pink-600 hover:bg-pink-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 I Health Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
