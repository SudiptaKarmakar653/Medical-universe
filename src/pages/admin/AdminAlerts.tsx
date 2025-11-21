
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

const AdminAlerts = () => {
  useTitle("System Alerts - Admin Dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    severity: "medium"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminSession = () => {
      const adminLoggedIn = localStorage.getItem('adminLoggedIn');
      if (adminLoggedIn !== 'true') {
        navigate('/admin-login');
      }
    };
    
    checkAdminSession();
    fetchAlerts();
  }, [navigate]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        toast({
          title: "Error",
          description: "Failed to fetch system alerts",
          variant: "destructive"
        });
      } else {
        setAlerts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addAlert = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('system_alerts')
        .insert({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          severity: formData.severity,
          is_resolved: false
        });

      if (error) throw error;

      toast({
        title: "Alert Added",
        description: "The new system alert was successfully added."
      });
      
      setIsAddModalOpen(false);
      setFormData({
        title: "",
        message: "",
        type: "info",
        severity: "medium"
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error adding alert:', error);
      toast({
        title: "Error",
        description: "Failed to add alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleAlertResolution = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ 
          is_resolved: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Updated",
        description: `Alert ${!currentStatus ? 'resolved' : 'reopened'} successfully.`
      });
      
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="admin" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="admin" onLogout={handleLogout} />
        
        <main className="flex-1 p-6 my-[50px] overflow-y-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">System Alerts</h1>
              <div className="space-x-4">
                <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Alert
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search alerts by title or message..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading system alerts...</div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "No alerts found matching your search" : "No system alerts found"}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAlerts.map(alert => (
                          <TableRow key={alert.id}>
                            <TableCell>{getTypeIcon(alert.type)}</TableCell>
                            <TableCell className="font-medium">{alert.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert.is_resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {alert.is_resolved ? 'Resolved' : 'Active'}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleAlertResolution(alert.id, alert.is_resolved)}
                              >
                                {alert.is_resolved ? 'Reopen' : 'Resolve'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Alert Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New System Alert</DialogTitle>
            <DialogDescription>
              Create a new system alert for monitoring purposes
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input 
                id="title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Alert Title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <textarea 
                id="message" 
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Alert message..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <select 
                  id="type"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="severity" className="text-sm font-medium">Severity</label>
                <select 
                  id="severity"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={addAlert}>Add Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAlerts;
