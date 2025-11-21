import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Heart, Stethoscope, Activity, User, Phone, ShoppingBag, Building2, Leaf } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

type UserRole = "patient" | "doctor" | "admin" | null;

interface NavbarProps {
  userRole?: UserRole;
  onScrollChange?: (isScrolled: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole = null, onScrollChange }) => {
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();

  // Handle navbar shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      onScrollChange?.(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onScrollChange]);

  // Get user role from Clerk user metadata
  const getUserRole = () => {
    if (user?.unsafeMetadata?.role) {
      return user.unsafeMetadata.role as UserRole;
    }
    return userRole;
  };

  const currentUserRole = getUserRole();

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 border-b border-blue-200 ${
        scrolled 
          ? "py-2 bg-white/95 shadow-md backdrop-blur-sm" 
          : "py-4 bg-white/80"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className={`${
            scrolled ? "w-9 h-9" : "w-10 h-10"
          } rounded-full bg-gradient-to-br from-medical-aqua to-medical-cyan flex items-center justify-center transition-all duration-300`}>
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className={`${
            scrolled ? "text-xl" : "text-2xl"
          } font-bold bg-gradient-to-r from-medical-aqua to-medical-cyan bg-clip-text text-transparent transition-all duration-300`}>
            MedicalUniverse
          </span>
        </Link>

        {!isMobile && (
          <div className="flex space-x-8 ml-10">
            <NavLink to="/" icon={<Heart className="h-4 w-4" />} label="Home" />
            <NavLink to="/hospital" icon={<Building2 className="h-4 w-4" />} label="Our Hospital" />
            <NavLink to="/store" icon={<ShoppingBag className="h-4 w-4" />} label="Medicine Store" />
            <NavLink to="/plant-identifier" icon={<Leaf className="h-4 w-4" />} label="Plant Identifier" />
            <NavLink to="/blood-support" icon={<Heart className="h-4 w-4" />} label="Blood Support" />
            <NavLink to="/services" icon={<Activity className="h-4 w-4" />} label="Services" />
            <NavLink to="/doctors" icon={<User className="h-4 w-4" />} label="Find Doctors" />
            <NavLink to="/health-assistant" icon={<Stethoscope className="h-4 w-4" />} label="Health Assistant" />
            <NavLink to="/contact" icon={<Phone className="h-4 w-4" />} label="Contact" />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                variant="outline" 
                className="rounded-full hover:bg-gradient-med hover:text-white hover:border-transparent transition-all"
              >
                Log in
              </Button>
            </SignInButton>
            <Link to="/auth">
              <Button className="rounded-full bg-gradient-med hover:shadow-lg hover:scale-105 transition-all">
                Sign up
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center space-x-2">
              {currentUserRole === 'patient' && (
                <Link to="/orders">
                  <Button variant="outline" className="rounded-full">
                    My Orders
                  </Button>
                </Link>
              )}
              <Link to={`/${currentUserRole || 'patient'}-dashboard`}>
                <Button 
                  variant="outline" 
                  className="rounded-full hover:bg-gradient-med hover:text-white hover:border-transparent transition-all"
                >
                  My Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <MobileNavLink to="/" icon={<Heart className="h-5 w-5" />} label="Home" />
                  <MobileNavLink to="/hospital" icon={<Building2 className="h-5 w-5" />} label="Our Hospital" />
                  <MobileNavLink to="/store" icon={<ShoppingBag className="h-5 w-5" />} label="Medicine Store" />
                  <MobileNavLink to="/plant-identifier" icon={<Leaf className="h-5 w-5" />} label="Plant Identifier" />
                  <MobileNavLink to="/blood-support" icon={<Heart className="h-5 w-5" />} label="Blood Support" />
                  <MobileNavLink to="/services" icon={<Activity className="h-5 w-5" />} label="Services" />
                  <MobileNavLink to="/doctors" icon={<User className="h-5 w-5" />} label="Find Doctors" />
                  <MobileNavLink to="/health-assistant" icon={<Stethoscope className="h-5 w-5" />} label="Health Assistant" />
                  <MobileNavLink to="/contact" icon={<Phone className="h-5 w-5" />} label="Contact" />
                  
                  <SignedIn>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <MobileNavLink to="/orders" icon={<Activity className="h-5 w-5" />} label="My Orders" />
                      <MobileNavLink to={`/${currentUserRole || 'patient'}-dashboard`} icon={<User className="h-5 w-5" />} label="My Dashboard" />
                    </div>
                  </SignedIn>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`group flex items-center font-medium transition-colors ${
        isActive 
          ? "text-[#22C55E]" 
          : "text-gray-700 hover:text-medical-aqua"
      }`}
    >
      <div className="flex items-center space-x-1">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`block transition-all duration-500 h-0.5 mt-0.5 ${
        isActive 
          ? "max-w-full bg-[#22C55E]" 
          : "max-w-0 group-hover:max-w-full bg-gradient-med"
      }`}></span>
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 font-medium text-lg px-2 py-3 rounded-lg transition-colors ${
        isActive 
          ? "bg-[#22C55E]/10 text-[#22C55E]" 
          : "hover:bg-gray-50"
      }`}
    >
      <span className={`p-2 rounded-full text-white ${
        isActive ? "bg-[#22C55E]" : "bg-gradient-med"
      }`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
