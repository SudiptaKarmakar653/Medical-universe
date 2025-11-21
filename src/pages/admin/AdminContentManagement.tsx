
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentPage {
  id: string;
  title: string;
  page_key: string;
  content: string;
  is_published: boolean;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

const AdminContentManagement = () => {
  useTitle("Content Management - Admin Dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<ContentPage | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    title: "",
    page_key: "",
    content: "",
    meta_description: "",
    is_published: true
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
    fetchContentPages();
  }, [navigate]);

  const fetchContentPages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content pages:', error);
        toast({
          title: "Error",
          description: "Failed to fetch content pages",
          variant: "destructive"
        });
      } else {
        setContentPages(data || []);
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

  const filteredPages = contentPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.page_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEditPage = (page: ContentPage | null = null) => {
    if (page) {
      setFormData({
        id: page.id,
        title: page.title,
        page_key: page.page_key,
        content: page.content,
        meta_description: page.meta_description || "",
        is_published: page.is_published
      });
    } else {
      setFormData({
        id: '',
        title: "",
        page_key: "",
        content: "",
        meta_description: "",
        is_published: true
      });
    }
    
    setIsAddEditModalOpen(true);
  };

  const handleDeletePage = (page: ContentPage) => {
    setCurrentPage(page);
    setIsDeleteDialogOpen(true);
  };

  const savePage = async () => {
    if (!formData.title || !formData.page_key) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (formData.id) {
        // Update existing page
        const { error } = await supabase
          .from('content_pages')
          .update({
            title: formData.title,
            page_key: formData.page_key,
            content: formData.content,
            meta_description: formData.meta_description,
            is_published: formData.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);

        if (error) throw error;

        toast({
          title: "Page Updated",
          description: "The content page was successfully updated."
        });
      } else {
        // Add new page
        const { error } = await supabase
          .from('content_pages')
          .insert({
            title: formData.title,
            page_key: formData.page_key,
            content: formData.content,
            meta_description: formData.meta_description,
            is_published: formData.is_published
          });

        if (error) throw error;

        toast({
          title: "Page Added",
          description: "The new content page was successfully added."
        });
      }
      
      setIsAddEditModalOpen(false);
      fetchContentPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Error",
        description: "Failed to save page. Please try again.",
        variant: "destructive"
      });
    }
  };

  const confirmDeletePage = async () => {
    if (!currentPage) return;

    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', currentPage.id);

      if (error) throw error;

      toast({
        title: "Page Deleted",
        description: `"${currentPage.title}" was successfully deleted.`
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentPage(null);
      fetchContentPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Error",
        description: "Failed to delete page. Please try again.",
        variant: "destructive"
      });
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
              <h1 className="text-2xl font-bold">Content Management</h1>
              <div className="space-x-4">
                <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => handleAddEditPage()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Page
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search pages by title or key..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading content pages...</div>
                ) : filteredPages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "No pages found matching your search" : "No content pages found"}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Page Key</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPages.map(page => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">{page.title}</TableCell>
                            <TableCell>{page.page_key}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {page.is_published ? 'Published' : 'Draft'}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleAddEditPage(page)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDeletePage(page)}>
                                <Trash className="h-3 w-3 mr-1" /> Delete
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

      {/* Add/Edit Page Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Page" : "Add New Page"}</DialogTitle>
            <DialogDescription>
              {formData.id ? "Update the page details" : "Enter the details for the new page"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input 
                id="title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Page Title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="page_key" className="text-sm font-medium">Page Key</label>
              <Input 
                id="page_key" 
                value={formData.page_key}
                onChange={(e) => setFormData({...formData, page_key: e.target.value})}
                placeholder="page-key-slug"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <textarea 
                id="content" 
                className="w-full min-h-[200px] p-2 border rounded-md"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Page content..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="meta_description" className="text-sm font-medium">Meta Description</label>
              <Input 
                id="meta_description" 
                value={formData.meta_description}
                onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                placeholder="SEO meta description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
              />
              <label htmlFor="is_published" className="text-sm font-medium">Published</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditModalOpen(false)}>Cancel</Button>
            <Button onClick={savePage}>Save Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Page Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentPage?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePage} className="bg-red-600 hover:bg-red-700">
              Yes, delete page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContentManagement;
