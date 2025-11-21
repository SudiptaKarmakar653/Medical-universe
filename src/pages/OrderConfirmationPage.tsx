
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/medical-store';
import { useTitle } from '@/hooks/use-title';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, MapPin, Phone, FileText, Truck } from 'lucide-react';

const OrderConfirmationPage = () => {
  useTitle('Order Confirmation - Medical Universe');
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) throw orderError;
      
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          medicine:medicine_id (*)
        `)
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      setOrder({
        ...orderData,
        items: items || []
      } as Order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout userRole={user ? 'patient' : null} className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout userRole={user ? 'patient' : null} className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 pb-4 text-center">
            <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find the order you're looking for.
            </p>
            <Button asChild>
              <Link to="/store">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout userRole={user ? 'patient' : null} className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto mb-6">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="mx-auto mb-4 bg-green-50 h-24 w-24 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600">
            Thank you for your order. We'll get it to you as soon as possible.
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Order ID: <span className="font-mono">{order.id}</span>
          </div>
          {order.tracking_number && (
            <div className="text-sm text-gray-500 mt-1">
              Tracking Number: <span className="font-mono font-medium">{order.tracking_number}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 divide-y">
                {order.items?.map((item: OrderItem) => (
                  <div key={item.id} className="pt-4 first:pt-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.medicine?.name}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.medicine?.category}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <span className="font-medium">Total Amount</span>
              <span className="font-bold text-lg">₹{order.total_price.toFixed(2)}</span>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Delivery Address</div>
                  <div className="text-gray-600">{order.address}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Contact Number</div>
                  <div className="text-gray-600">{order.phone}</div>
                </div>
              </div>

              {order.tracking_number && (
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Tracking Information</div>
                    <div className="text-gray-600 font-mono">{order.tracking_number}</div>
                    {order.estimated_delivery && (
                      <div className="text-sm text-gray-500 mt-1">
                        Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {order.prescription_url && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Prescription</div>
                    <a 
                      href={order.prescription_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Prescription
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status ? "bg-green-500" : "bg-gray-300"
                  }`} />
                  <span className={order.status === "pending" ? "font-medium" : ""}>
                    Order Placed
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === "processing" ? "bg-blue-500" : 
                    (order.status === "shipped" || order.status === "delivered") ? "bg-green-500" : "bg-gray-300"
                  }`} />
                  <span className={order.status === "processing" ? "font-medium" : ""}>
                    Processing
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === "shipped" || order.status === "delivered" ? "bg-green-500" : "bg-gray-300"
                  }`} />
                  <span className={order.status === "shipped" ? "font-medium" : ""}>
                    Shipped
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === "delivered" ? "bg-green-500" : "bg-gray-300"
                  }`} />
                  <span className={order.status === "delivered" ? "font-medium" : ""}>
                    Delivered
                  </span>
                </div>
                
                <div className="pt-2 mt-2 border-t text-sm text-gray-500">
                  Current status: 
                  <span className="font-medium ml-1 capitalize">{order.status}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="space-y-4 w-full">
                <Button asChild className="w-full">
                  <Link to="/orders">
                    View All Orders
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/store">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderConfirmationPage;
