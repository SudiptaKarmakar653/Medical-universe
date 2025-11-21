
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitle } from '@/hooks/use-title';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/context/auth-provider';
import PageLayout from '@/components/layout/PageLayout';
import OrderCard from '@/components/orders/OrderCard';
import EmptyOrdersState from '@/components/orders/EmptyOrdersState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package2, Search, Filter, Truck, Clock, CheckCircle } from 'lucide-react';

const OrdersPage = () => {
  useTitle('Your Orders - Medical Universe');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get user phone from Clerk
  let userPhone = null;
  
  if (user?.primaryPhoneNumber?.phoneNumber) {
    userPhone = user.primaryPhoneNumber.phoneNumber;
  } else if (user?.phoneNumbers && user.phoneNumbers.length > 0) {
    userPhone = user.phoneNumbers[0].phoneNumber;
  }
  
  console.log('OrdersPage - Full user object:', user);
  console.log('OrdersPage - Extracted phone:', userPhone);
  
  const { orders, loading } = useOrders(userPhone);

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (!user) {
    return (
      <PageLayout className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto border border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <Package2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <CardTitle className="text-xl">Please Log In</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your orders.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Log In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout userRole="patient" className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your medicine orders</p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search Orders</span>
            </Button>
          </div>

          {/* Order Statistics */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Package2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
                    <div className="text-sm text-gray-500">Total Orders</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{orderStats.processing}</div>
                    <div className="text-sm text-gray-500">Processing</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Truck className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{orderStats.shipped}</div>
                    <div className="text-sm text-gray-500">Shipped</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{orderStats.delivered}</div>
                    <div className="text-sm text-gray-500">Delivered</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders List or Empty State */}
        {!loading && (
          <>
            {orders.length === 0 ? (
              <EmptyOrdersState 
                hasPhoneNumber={!!userPhone}
                onUpdateProfile={() => navigate('/auth')}
              />
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default OrdersPage;
