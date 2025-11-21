import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitle } from '@/hooks/use-title';
import { useAdmin } from '@/hooks/use-admin';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Medicine } from '@/types/medical-store';
import { useMedicines } from '@/hooks/use-medicines';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Package, Plus, Edit, Trash2, Eye, Pencil, LogOut, ShoppingBag, Users } from 'lucide-react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import { useToast } from '@/hooks/use-toast';

const MedicineAdminDashboard = () => {
  useTitle('Admin Dashboard - Medical Store');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAdminSession, adminLogout, allOrders, fetchAllOrders, ordersLoading, updateOrderStatus, adminLoading, addMedicine, updateMedicine, deleteMedicine } = useAdmin();
  const { medicines, categories, loading: medicinesLoading, refreshMedicines } = useMedicines();
  
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  
  // New medicine form state
  const [medicineName, setMedicineName] = useState('');
  const [medicineDescription, setMedicineDescription] = useState('');
  const [medicinePrice, setMedicinePrice] = useState('');
  const [medicineCategory, setMedicineCategory] = useState('');
  const [medicineStock, setMedicineStock] = useState('');
  const [medicineImageUrl, setMedicineImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Order filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  useEffect(() => {
    const adminSession = checkAdminSession();
    
    if (!adminSession) {
      navigate('/admin');
      return;
    }
    
    // Fetch all orders
    fetchAllOrders();
  }, []);
  
  // Reset form when selected medicine changes or dialog closes
  useEffect(() => {
    if (selectedMedicine) {
      setMedicineName(selectedMedicine.name);
      setMedicineDescription(selectedMedicine.description || '');
      setMedicinePrice(selectedMedicine.price.toString());
      setMedicineCategory(selectedMedicine.category);
      setMedicineStock(selectedMedicine.stock.toString());
      setMedicineImageUrl(selectedMedicine.image_url || '');
      setIsEditing(true);
    } else {
      resetMedicineForm();
      setIsEditing(false);
    }
  }, [selectedMedicine]);

  const resetMedicineForm = () => {
    setMedicineName('');
    setMedicineDescription('');
    setMedicinePrice('');
    setMedicineCategory('');
    setMedicineStock('');
    setMedicineImageUrl('');
  };
  
  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicineData = {
      id: selectedMedicine?.id,
      name: medicineName,
      description: medicineDescription,
      price: parseFloat(medicinePrice),
      category: medicineCategory,
      stock: parseInt(medicineStock),
      stock_quantity: parseInt(medicineStock),
      image_url: medicineImageUrl,
      requires_prescription: false
    };
    
    if (isEditing && selectedMedicine) {
      await updateMedicine(medicineData);
    } else {
      await addMedicine(medicineData);
    }
    
    // Refresh medicines list
    refreshMedicines();
    setIsMedicineDialogOpen(false);
    setSelectedMedicine(null);
  };
  
  const handleDeleteMedicine = async () => {
    if (selectedMedicine) {
      await deleteMedicine(selectedMedicine.id);
      refreshMedicines();
      setIsDeleteDialogOpen(false);
      setSelectedMedicine(null);
    }
  };
  
  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'shipped' | 'delivered') => {
    try {
      console.log('Dashboard: Updating order status:', { orderId, status, fullOrderId: orderId });
      
      // Ensure we're using the full UUID
      if (!orderId || orderId.length < 36) {
        throw new Error('Invalid order ID format');
      }
      
      // Update the order status
      await updateOrderStatus(orderId, status);
      
      // No need for additional success toast as it's handled in useAdmin
      
    } catch (error) {
      console.error('Dashboard: Failed to update order status:', error);
      
      // Additional error handling for better user experience
      toast({
        title: "Update Failed",
        description: "Could not update order status. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewOrderDetails = (order: any) => {
    console.log('Viewing order details for:', order);
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };
  
  // Filter orders by status
  const filteredOrders = statusFilter 
    ? allOrders.filter(order => order.status === statusFilter)
    : allOrders;
  
  return (
    <PageLayout userRole="admin" className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Store Admin Dashboard</h1>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{medicines.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {allOrders.filter(order => order.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="medicines">
        <TabsList className="mb-6">
          <TabsTrigger value="medicines">
            <Package className="h-4 w-4 mr-2" />
            Manage Medicines
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Manage Orders
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="medicines">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Medicines</CardTitle>
                  <CardDescription>Manage your store's medicine inventory</CardDescription>
                </div>
                <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setSelectedMedicine(null);
                      setIsEditing(false);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Medicine
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleMedicineSubmit}>
                      <DialogHeader>
                        <DialogTitle>
                          {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
                        </DialogTitle>
                        <DialogDescription>
                          {isEditing ? 'Update medicine details below.' : 'Add the details for the new medicine.'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Medicine Name</Label>
                            <Input 
                              id="name" 
                              value={medicineName} 
                              onChange={(e) => setMedicineName(e.target.value)} 
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={medicineCategory} 
                              onValueChange={setMedicineCategory}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...new Set([...categories, 'Fever', 'Pain', 'Sugar', 'BP', 'Skin', 'Allergy', 'Respiratory', 'Digestive'])].map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input 
                            id="description" 
                            value={medicineDescription} 
                            onChange={(e) => setMedicineDescription(e.target.value)} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input 
                              id="price" 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={medicinePrice} 
                              onChange={(e) => setMedicinePrice(e.target.value)} 
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input 
                              id="stock" 
                              type="number" 
                              min="0" 
                              value={medicineStock} 
                              onChange={(e) => setMedicineStock(e.target.value)} 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input 
                            id="imageUrl" 
                            value={medicineImageUrl} 
                            onChange={(e) => setMedicineImageUrl(e.target.value)} 
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={adminLoading}
                        >
                          {adminLoading ? 'Saving...' : (isEditing ? 'Update Medicine' : 'Add Medicine')}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {medicinesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : medicines.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No medicines in inventory yet.</p>
                  <Button onClick={() => setIsMedicineDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Medicine
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 font-medium">Stock</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((medicine) => (
                        <tr key={medicine.id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                                {medicine.image_url ? (
                                  <img 
                                    src={medicine.image_url} 
                                    alt={medicine.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              {medicine.name}
                            </div>
                          </td>
                          <td className="py-3">{medicine.category}</td>
                          <td className="py-3">₹{medicine.price.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`${
                              medicine.stock <= 10 ? 'text-red-500' : 'text-green-600'
                            }`}>
                              {medicine.stock}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMedicine(medicine);
                                  setIsMedicineDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedMedicine(medicine);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Manage orders and track delivery status</CardDescription>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="status-filter" className="whitespace-nowrap">Status Filter:</Label>
                    <Select 
                      value={statusFilter || 'all'} 
                      onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => fetchAllOrders()}
                    disabled={ordersLoading}
                  >
                    {ordersLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-green-100 text-green-800'}`}
                              >
                                {order.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Phone: {order.phone || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <p className="line-clamp-1">
                                Items: {order.items?.map(item => 
                                  `${item.medicine?.name || 'Unknown'} × ${item.quantity}`
                                ).join(', ') || 'No items'}
                              </p>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              Full ID: {order.id}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-medium text-right">₹{order.total_price.toFixed(2)}</div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Select
                                value={order.status}
                                onValueChange={(value: 'pending' | 'shipped' | 'delivered') => 
                                  handleUpdateOrderStatus(order.id, value)
                                }
                                disabled={adminLoading}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMedicine?.name} from your inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMedicine}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={isOrderDetailsOpen}
        onClose={() => {
          setIsOrderDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </PageLayout>
  );
};

export default MedicineAdminDashboard;
