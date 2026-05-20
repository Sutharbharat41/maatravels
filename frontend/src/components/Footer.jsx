import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Car, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Logo & Intro */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center">
                <img
                  src="/LOGO_MAIN1.png"
                  alt="MAA TRAVELS Logo"
                  className="w-16 h-16 object-contain rounded-[60%] border-[30%]"
                />
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white">MAA TRAVELS</span>
            </Link>
            <p className="text-sm text-slate-400">
              Professional Vehicle Hiring Services for Corporate & Personal Travel. Offering standard rentals, employee transport, and contract vehicles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">About Company</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary-400 transition-colors">Our Services</Link>
              </li>
              <li>
                <Link to="/fleet" className="hover:text-primary-400 transition-colors">Vehicle Fleet</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Services Offered</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Corporate Employee Transport</li>
              <li>Monthly Contract Vehicles</li>
              <li>Airport Pick & Drop</li>
              <li>Outstation & Casual Family Trips</li>
              <li>Driver-on-demand Services</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Contact Us</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin size={16} className="text-primary-400 mt-1 shrink-0" />
                <span className="text-slate-400">2/68 SHREEJI TENAMENT NR CK PRAJAPATI SCHOOL GORWA VADODARA-390016 GUJARAT</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span className="text-slate-400">+91 9925223472</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail size={16} className="text-primary-400 shrink-0" />
                <span className="text-slate-400">kanuvaghela486@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MAA Travels. All rights reserved 2026.</p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
