import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTitle } from "@/hooks/use-title";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserCheck,
  FileText,
  Settings,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Package,
  ShoppingBag,
  Plus,
  Building2,
  Heart,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  role: "patient" | "doctor" | "admin";
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  pendingRequests: number;
  totalPatients: number;
  totalMedicines: number;
  lowStockMedicines: number;
  totalOrders: number;
  pendingOrders: number;
  totalBloodRequests: number;
  pendingBloodRequests: number;
}

const AdminDashboard = () => {
  useTitle("Admin Dashboard - Medical Universe");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDoctors: 0,
    pendingRequests: 0,
    totalPatients: 0,
    totalMedicines: 0,
    lowStockMedicines: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalBloodRequests: 0,
    pendingBloodRequests: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const totalUsers = profiles?.length || 0;
      const totalDoctors = profiles?.filter(p => p.role === "doctor").length || 0;
      const totalPatients = profiles?.filter(p => p.role === "patient").length || 0;

      const { data: doctorRequests, error: doctorError } = await supabase
        .from("doctor_verification_requests")
        .select("*")
        .eq("status", "pending");

      if (doctorError) {
        console.error('Error fetching doctor requests:', doctorError);
      }

      const pendingRequests = doctorRequests?.length || 0;

      const { data: medicines, error: medicinesError } = await supabase
        .from("medicines")
        .select("*");

      if (medicinesError) {
        console.error('Error fetching medicines:', medicinesError);
      }

      const totalMedicines = medicines?.length || 0;
      const lowStockMedicines = medicines?.filter(m => m.stock <= 10).length || 0;

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;

      const { data: bloodRequests, error: bloodError } = await supabase
        .from("blood_requests")
        .select("*");

      if (bloodError) {
        console.error('Error fetching blood requests:', bloodError);
      }

      const totalBloodRequests = bloodRequests?.length || 0;
      const pendingBloodRequests = bloodRequests?.filter(r => r.status === "pending").length || 0;

      setStats({
        totalUsers,
        totalDoctors,
        totalPatients,
        pendingRequests,
        totalMedicines,
        lowStockMedicines,
        totalOrders,
        pendingOrders,
        totalBloodRequests,
        pendingBloodRequests,
      });

      const { data: recentProfiles, error: recentError } = await supabase
        .from("profiles")
        .select("id, name, role, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) {
        console.error('Error fetching recent users:', recentError);
      } else if (recentProfiles) {
        setRecentUsers(recentProfiles as UserProfile[]);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/admin-login');
  };

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to the requested page",
        variant: "destructive",
      });
    }
  };

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all user accounts",
      icon: Users,
      path: "/admin-dashboard/users",
      color: "bg-blue-500",
    },
    {
      title: "Hospital Management",
      description: "Manage hospital beds and operation theaters",
      icon: Building2,
      path: "/admin/hospital-management",
      color: "bg-blue-600",
    },
    {
      title: "Blood Management",
      description: "Manage blood requests and donor applications",
      icon: Heart,
      path: "/admin/blood-management",
      color: "bg-red-500",
      badge: stats.pendingBloodRequests > 0 ? `${stats.pendingBloodRequests} Pending` : undefined,
    },
    {
      title: "Medicine Management",
      description: "Add, edit, and manage medicine inventory",
      icon: Package,
      path: "/admin/medicines",
      color: "bg-green-500",
      badge: stats.lowStockMedicines > 0 ? `${stats.lowStockMedicines} Low Stock` : undefined,
    },
    {
      title: "Doctor Requests",
      description: "Review pending doctor applications",
      icon: UserCheck,
      path: "/admin-dashboard/requests",
      color: "bg-purple-500",
      badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined,
    },
    {
      title: "Orders Management",
      description: "View and manage all customer orders",
      icon: ShoppingBag,
      path: "/admin/dashboard",
      color: "bg-orange-500",
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} Pending` : undefined,
    },
    {
      title: "Content Management",
      description: "Manage platform content and settings",
      icon: FileText,
      path: "/admin-dashboard/content",
      color: "bg-teal-500",
    },
    {
      title: "System Alerts",
      description: "Monitor system health and alerts",
      icon: AlertTriangle,
      path: "/admin-dashboard/alerts",
      color: "bg-red-500",
    },
    {
      title: "Support Center",
      description: "Manage user support tickets",
      icon: HelpCircle,
      path: "/admin-dashboard/support",
      color: "bg-indigo-500",
    },
    {
      title: "Settings",
      description: "Configure platform settings",
      icon: Settings,
      path: "/admin-dashboard/settings",
      color: "bg-gray-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome, {localStorage.getItem('adminUser') || 'Admin'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleNavigation("/")} 
                variant="outline"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => handleNavigation("/admin/medicines")} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDoctors}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMedicines}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-3xl font-bold text-red-600">{stats.lowStockMedicines}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blood Requests</p>
                  <p className="text-3xl font-bold text-red-600">{stats.totalBloodRequests}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent 
                className="p-6" 
                onClick={() => handleNavigation(action.path)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                  {action.badge && (
                    <Badge variant="destructive" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent users found</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {user.role} • Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={user.role === "doctor" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
