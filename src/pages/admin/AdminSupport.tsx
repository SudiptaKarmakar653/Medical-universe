
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
import { MessageSquare, User, Clock, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  user_id: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const AdminSupport = () => {
  useTitle("Support Center - Admin Dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
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
    fetchTickets();
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch support tickets",
          variant: "destructive"
        });
      } else {
        setTickets(data || []);
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

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRespondToTicket = (ticket: SupportTicket) => {
    setCurrentTicket(ticket);
    setResponseText(ticket.admin_response || "");
    setIsResponseModalOpen(true);
  };

  const saveResponse = async () => {
    if (!currentTicket || !responseText.trim()) {
      toast({
        title: "Missing Response",
        description: "Please enter a response message",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          admin_response: responseText,
          status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTicket.id);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your response has been saved successfully."
      });
      
      setIsResponseModalOpen(false);
      setCurrentTicket(null);
      setResponseText("");
      fetchTickets();
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const closeTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Ticket Closed",
        description: "The support ticket has been closed."
      });
      
      fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to close ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100';
      case 'responded':
        return 'text-purple-600 bg-purple-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
              <h1 className="text-2xl font-bold">Support Center</h1>
              <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>
                Back to Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                      <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {tickets.filter(t => t.status === 'open').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Responded</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {tickets.filter(t => t.status === 'responded').length}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Closed</p>
                      <p className="text-3xl font-bold text-gray-600">
                        {tickets.filter(t => t.status === 'closed').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search tickets by title or description..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading support tickets...</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "No tickets found matching your search" : "No support tickets found"}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map(ticket => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRespondToTicket(ticket)}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" /> 
                                {ticket.admin_response ? 'Edit Response' : 'Respond'}
                              </Button>
                              {ticket.status !== 'closed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => closeTicket(ticket.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" /> Close
                                </Button>
                              )}
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

      {/* Response Modal */}
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Support Ticket</DialogTitle>
            <DialogDescription>
              Ticket: {currentTicket?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Message</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{currentTicket?.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="response" className="text-sm font-medium">Your Response</label>
              <textarea 
                id="response" 
                className="w-full min-h-[200px] p-3 border rounded-md"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Enter your response to the user..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseModalOpen(false)}>Cancel</Button>
            <Button onClick={saveResponse}>Save Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;
