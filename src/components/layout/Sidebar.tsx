
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, UserRound, FilePen, Clock, Search, FileImage, ShoppingCart, Video, Bell, Users, MessageCircle, BookOpen, LogOut, Shield, UserCheck, Baby, UserX, Heart, Building, Camera, Stethoscope } from "lucide-react";

type UserRole = "patient" | "doctor" | "admin";

interface SidebarProps {
  userRole: UserRole;
  className?: string;
  onLogout?: () => void;
}

export function Sidebar({
  userRole,
  className,
  onLogout
}: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (isMobile) return null;
  
  
  const patientLinks = [{
    name: "Dashboard",
    href: "/patient-dashboard",
    icon: UserRound
  }, {
    name: "Find Doctors",
    href: "/patient-dashboard/find-doctors",
    icon: Search
  }, {
    name: "Appointments",
    href: "/patient-dashboard/appointments",
    icon: Calendar
  }, {
    name: "🏥 My Hospital Bookings",
    href: "/patient-dashboard/hospital-bookings",
    icon: Building
  }, {
    name: "Prescriptions",
    href: "/patient-dashboard/prescriptions",
    icon: FilePen
  }, {
    name: "🛏️ Recovery Journey",
    href: "/patient-dashboard/recovery-journey",
    icon: Heart
  }, {
    name: "🤖 AI Skin Analyzer",
    href: "/patient-dashboard/skin-analyzer",
    icon: Camera
  }, {
    name: "Medicine Orders",
    href: "/patient-dashboard/orders",
    icon: ShoppingCart
  }, {
    name: "Yoga Program",
    href: "/patient-dashboard/yoga",
    icon: Video
  }, {
    name: "🤰 AI Pregnancy Guide",
    href: "/patient-dashboard/pregnancy-guide",
    icon: Baby
  }, {
    name: "Health Articles",
    href: "/patient-dashboard/articles",
    icon: BookOpen
  }];
  
  const doctorLinks = [{
    name: "Dashboard",
    href: "/doctor-dashboard",
    icon: UserRound
  }, {
    name: "Appointments",
    href: "/doctor-dashboard/appointments",
    icon: Calendar
  }, {
    name: "Patients",
    href: "/doctor-dashboard/patients",
    icon: Users
  }, {
    name: "Past Patients",
    href: "/doctor-dashboard/past-patients",
    icon: UserX
  }, {
    name: "Prescriptions",
    href: "/doctor-dashboard/prescriptions",
    icon: FilePen
  }, {
    name: "Schedule",
    href: "/doctor-dashboard/schedule",
    icon: Clock
  }, {
    name: "🩹 Lung Sound Analyzer",
    href: "/doctor-dashboard/lung-analyzer",
    icon: Stethoscope
  }];
  
  const adminLinks = [{
    name: "Dashboard",
    href: "/admin-dashboard",
    icon: UserRound
  }, {
    name: "Manage Users",
    href: "/admin-dashboard/users",
    icon: Users
  }, {
    name: "Doctor Requests",
    href: "/admin-dashboard/requests",
    icon: FileImage
  }, {
    name: "Doctor Verification",
    href: "/admin-dashboard/doctor-verification",
    icon: UserCheck
  }, {
    name: "Content Management",
    href: "/admin-dashboard/content",
    icon: BookOpen
  }, {
    name: "Emergency Alerts",
    href: "/admin-dashboard/alerts",
    icon: Bell
  }];
  
  let links;
  switch (userRole) {
    case "patient":
      links = patientLinks;
      break;
    case "doctor":
      links = doctorLinks;
      break;
    case "admin":
      links = adminLinks;
      break;
    default:
      links = [];
  }
  
  return (
    <div className="mt-[2.5cm]">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {userRole === "patient" ? "Patient Portal" : userRole === "doctor" ? "Doctor Portal" : "Admin Portal"}
          </h2>
          <div className="space-y-1">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 transition-colors", 
                    isActive 
                      ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500 font-medium shadow-sm" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-blue-600" : "text-gray-500")} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Help & Support
          </h2>
          <div className="space-y-1">
            <Link 
              to="/admin-dashboard/support" 
              className={cn(
                "flex items-center rounded-md px-3 py-2 transition-colors",
                location.pathname === "/admin-dashboard/support"
                  ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500 font-medium shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageCircle className={cn("mr-2 h-4 w-4", location.pathname === "/admin-dashboard/support" ? "text-blue-600" : "text-gray-500")} />
              Contact Support
            </Link>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center rounded-md px-3 py-2 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4 text-gray-500" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
