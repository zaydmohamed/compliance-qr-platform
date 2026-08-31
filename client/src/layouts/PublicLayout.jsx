import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { QrCode, Shield, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar variant="public" />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating AI Chatbot for Public Visitors */}
      <ChatbotWidget mode="PUBLIC" />

      {/* Footer */}
      <footer className="bg-[#2C3925] text-white border-t border-[#212B1C] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0086FF] flex items-center justify-center text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  COMPLIANCE <span className="text-[#0086FF]">QR</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Enterprise compliance QR code platform connecting institutions with citizen feedback and grievance reporting.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0086FF] mb-3">
                Target Sectors
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/80 font-medium">
                <li>Hospitals & Medical Clinics</li>
                <li>Hotels & Restaurants</li>
                <li>Universities & Schools</li>
                <li>Government & Public Offices</li>
                <li>NGOs & Private Enterprises</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0086FF] mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/80 font-medium">
                <li><Link to="/" className="hover:text-white transition-colors">Platform Overview</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Compliance QR</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0086FF] mb-3">
                Contact Office
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/80 font-medium">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0086FF]" />
                  <span>+252 61 000 0000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0086FF]" />
                  <span>support@complianceqr.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0086FF]" />
                  <span>Mogadishu, Somalia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#3D4F34] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-200/50">
            <p>© {new Date().getFullYear()} Compliance QR Platform. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-medium">Built with MERN Stack • Multi-Tenant Architecture</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
