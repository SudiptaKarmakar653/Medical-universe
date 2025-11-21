
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTitle } from '@/hooks/use-title';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminMedicineManagement = () => {
  useTitle('Medicine Management - Admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch medicines
  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['admin-medicines'],
    queryFn: async () => {
      console.log('Fetching medicines...');
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching medicines:', error);
        throw error;
      }
      console.log('Fetched medicines:', data);
      return data;
    }
  });

  // Add medicine mutation - simplified
  const addMedicineMutation = useMutation({
    mutationFn: async (medicineData: any) => {
      console.log('Adding medicine:', medicineData);
      
      // Ensure all required fields are present
      const dataToInsert = {
        name: medicineData.name,
        category: medicineData.category,
        price: Number(medicineData.price),
        stock: Number(medicineData.stock),
        description: medicineData.description || '',
        image_url: medicineData.image_url || '/placeholder.svg',
      };
      
      console.log('Data to insert:', dataToInsert);
      
      const { data, error } = await supabase
        .from('medicines')
        .insert([dataToInsert])
        .select();
      
      if (error) {
        console.error('Error adding medicine:', error);
        throw error;
      }
      
      console.log('Medicine added successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Medicine add success:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-categories'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Medicine has been added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error adding medicine:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add medicine. Please check all required fields.",
        variant: "destructive"
      });
    }
  });

  // Update medicine mutation
  const updateMedicineMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('Updating medicine:', id, data);
      
      const dataToUpdate = {
        name: data.name,
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description || '',
        image_url: data.image_url || '/placeholder.svg',
      };
      
      const { error } = await supabase
        .from('medicines')
        .update(dataToUpdate)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating medicine:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-categories'] });
      setIsEditDialogOpen(false);
      setEditingMedicine(null);
      toast({
        title: "Success",
        description: "Medicine has been updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating medicine:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update medicine",
        variant: "destructive"
      });
    }
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting medicine:', id);
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting medicine:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-categories'] });
      toast({
        title: "Success",
        description: "Medicine has been deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting medicine:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete medicine",
        variant: "destructive"
      });
    }
  });

  const handleAddMedicine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted for adding medicine');
    
    const formData = new FormData(e.currentTarget);
    const medicineData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: formData.get('price') as string,
      stock: formData.get('stock') as string,
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string,
    };
    
    console.log('Form data extracted:', medicineData);
    
    // Validate required fields
    if (!medicineData.name || !medicineData.category || !medicineData.price || !medicineData.stock) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Category, Price, Stock)",
        variant: "destructive"
      });
      return;
    }
    
    addMedicineMutation.mutate(medicineData);
  };

  const handleEditMedicine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted for editing medicine');
    
    const formData = new FormData(e.currentTarget);
    const medicineData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: formData.get('price') as string,
      stock: formData.get('stock') as string,
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string,
    };
    
    console.log('Edit form data:', medicineData);
    
    // Validate required fields
    if (!medicineData.name || !medicineData.category || !medicineData.price || !medicineData.stock) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Category, Price, Stock)",
        variant: "destructive"
      });
      return;
    }
    
    updateMedicineMutation.mutate({ id: editingMedicine.id, data: medicineData });
  };

  const MedicineForm = ({ medicine, onSubmit, submitText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={medicine?.name || ''}
          placeholder="Enter medicine name"
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          name="category"
          defaultValue={medicine?.category || ''}
          placeholder="Enter category"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={medicine?.price || ''}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={medicine?.stock || ''}
            placeholder="0"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={medicine?.image_url || ''}
          placeholder="/placeholder.svg"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={medicine?.description || ''}
          placeholder="Enter medicine description"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={addMedicineMutation.isPending || updateMedicineMutation.isPending}
      >
        {addMedicineMutation.isPending || updateMedicineMutation.isPending ? "Saving..." : submitText}
      </Button>
    </form>
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
              <p className="text-gray-600">Manage your medicine inventory</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <MedicineForm 
                onSubmit={handleAddMedicine} 
                submitText="Add Medicine"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-3xl font-bold text-gray-900">{medicines.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-3xl font-bold text-red-600">
                    {medicines.filter(m => m.stock <= 10).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(medicines.map(m => m.category)).size}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading medicines...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <Card key={medicine.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{medicine.name}</CardTitle>
                      <CardDescription>{medicine.category}</CardDescription>
                    </div>
                    <Badge variant={medicine.stock > 10 ? "default" : "destructive"}>
                      <Package className="h-3 w-3 mr-1" />
                      {medicine.stock}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="font-semibold text-lg text-blue-600">₹{medicine.price}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{medicine.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingMedicine(medicine)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Medicine</DialogTitle>
                        </DialogHeader>
                        <MedicineForm 
                          medicine={editingMedicine}
                          onSubmit={handleEditMedicine} 
                          submitText="Update Medicine"
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this medicine?')) {
                          deleteMedicineMutation.mutate(medicine.id);
                        }
                      }}
                      disabled={deleteMedicineMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminMedicineManagement;
