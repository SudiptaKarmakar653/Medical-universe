
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/context/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, MapPin, Phone, ShoppingCart, Truck } from "lucide-react";

const PatientOrders = () => {
  useTitle("My Orders - Medical Universe");
  const { user } = useAuth();
  
  // Get user phone from Clerk - try multiple ways to access it
  let userPhone = null;
  
  if (user?.primaryPhoneNumber?.phoneNumber) {
    userPhone = user.primaryPhoneNumber.phoneNumber;
  } else if (user?.phoneNumbers && user.phoneNumbers.length > 0) {
    userPhone = user.phoneNumbers[0].phoneNumber;
  }
  
  console.log('PatientOrders - Full user object:', user);
  console.log('PatientOrders - Extracted phone:', userPhone);
  
  const { orders, loading } = useOrders(userPhone);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar userRole="patient" />
        <div className="flex-1 flex">
          <Sidebar userRole="patient" className="hidden lg:block" />
          <main className="flex-1 p-6">
            <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
              <p>Loading your orders...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Medicine Orders</h1>
              <Button className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Order Medicines
              </Button>
            </div>

            {!userPhone && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  To view your orders, please add a phone number to your profile. 
                  Orders are now tracked by phone number for better delivery coordination.
                </p>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          Items ({order.items?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.medicine?.name || 'Medicine'}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">₹{item.price}</p>
                            </div>
                          )) || (
                            <p className="text-gray-500">No items found</p>
                          )}
                        </div>
                      </div>

                      {/* Tracking Information */}
                      {order.tracking_number && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start">
                            <Truck className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-800">Tracking Information</p>
                              <p className="text-blue-700 font-mono text-sm">{order.tracking_number}</p>
                              {order.estimated_delivery && (
                                <p className="text-blue-600 text-sm">
                                  Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery Info */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-800">Delivery Address</p>
                            <p className="text-gray-700">{order.address}</p>
                            <p className="text-gray-700">Phone: {order.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Total and Actions */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div>
                          <p className="text-lg font-bold">Total: ₹{order.total_price}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Track Order
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Contact Support
                          </Button>
                          {order.status === "delivered" && (
                            <Button>Reorder</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {orders.length === 0 && userPhone && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                <Button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Start Shopping
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientOrders;
