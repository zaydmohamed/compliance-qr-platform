import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, QrCode, Shield, Building2, Menu, X } from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

export const Navbar = ({ variant = 'dashboard', title, onToggleSidebar }) => {
  const { user, logout, isPlatformAdmin, platformSettings } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentLogo = isPlatformAdmin
    ? platformSettings?.logo
    : user?.organization?.logo;

  if (variant === 'public') {
    const desktopLinkClass = ({ isActive }) =>
      isActive
        ? 'text-[#0086FF] font-bold border-b-2 border-[#0086FF] pb-1 transition-all'
        : 'text-[#5A5856] hover:text-[#2C3925] font-semibold transition-colors pb-1 border-b-2 border-transparent';

    const mobileLinkClass = ({ isActive }) =>
      isActive
        ? 'block px-3 py-2 rounded-xl text-xs font-bold text-[#0086FF] bg-blue-50/70 border border-blue-100'
        : 'block px-3 py-2 rounded-xl text-xs font-semibold text-[#2F2E2D] hover:bg-slate-50';

    return (
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            {platformSettings?.logo && !imgError ? (
              <img
                src={platformSettings.logo}
                alt=""
                onError={() => setImgError(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white object-contain p-1 border border-slate-200 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2C3925] flex items-center justify-center text-white shadow-md flex-shrink-0">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="truncate">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#2C3925] block truncate">
                {platformSettings?.platformName || (
                  <>COMPLIANCE <span className="text-[#0086FF]">QR</span></>
                )}
              </span>
              <p className="text-[9px] sm:text-[10px] font-medium text-[#5A5856] -mt-0.5 tracking-wider uppercase truncate">
                Feedback & Complaint Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs">
            <NavLink to="/" end className={desktopLinkClass}>Home</NavLink>
            <NavLink to="/about" className={desktopLinkClass}>About System</NavLink>
            <NavLink to="/contact" className={desktopLinkClass}>Contact</NavLink>
          </nav>

          {/* Right Action / Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to={isPlatformAdmin ? '/admin/overview' : '/organization/overview'}
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 sm:gap-2"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0086FF]" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#2C3925] hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              About System
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Contact Support
            </NavLink>
          </div>
        )}
      </header>
    );
  }

  // Dashboard Navbar
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl md:hidden transition-colors flex-shrink-0"
          title="Open Menu"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5 text-[#2C3925]" />
        </button>

        <h2 className="text-sm sm:text-base font-bold text-[#2F2E2D] truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Org or Admin Badge (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EEF2EC] border border-[#2C3925]/10 text-xs">
          {isPlatformAdmin ? (
            <>
              {platformSettings?.logo ? (
                <img
                  src={platformSettings.logo}
                  alt=""
                  className="w-4 h-4 object-contain rounded"
                />
              ) : (
                <Shield className="w-3.5 h-3.5 text-[#2C3925]" />
              )}
              <span className="font-bold text-[#2C3925] truncate max-w-[120px] md:max-w-[200px]">
                {platformSettings?.platformName || 'Platform Super Admin'}
              </span>
            </>
          ) : (
            <>
              {user?.organization?.logo ? (
                <img
                  src={user.organization.logo}
                  alt=""
                  className="w-4 h-4 object-contain rounded"
                />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-[#0086FF]" />
              )}
              <span className="font-bold text-[#2F2E2D] truncate max-w-[120px] md:max-w-[200px]">
                {user?.organization?.name || user?.fullName}
              </span>
            </>
          )}
        </div>

        {/* User profile dropdown info */}
        <div className="flex items-center gap-2 sm:gap-2.5 sm:pl-2 sm:border-l border-slate-200">
          {currentLogo ? (
            <img
              src={currentLogo}
              alt=""
              className="w-8 h-8 rounded-full object-contain border border-slate-200 bg-white p-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="hidden lg:block text-left max-w-[110px]">
            <p className="text-xs font-bold text-[#2F2E2D] leading-none truncate">{user?.fullName}</p>
            <p className="text-[10px] text-[#5A5856] mt-0.5 font-medium truncate">@{user?.username}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-0.5 sm:ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
