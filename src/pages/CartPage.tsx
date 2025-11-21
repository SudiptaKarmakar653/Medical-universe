
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/auth-provider';
import { useTitle } from '@/hooks/use-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  useTitle('Your Cart - Medical Universe');
  const { user } = useAuth();
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    calculateTotal
  } = useCart(user?.id || null);
  const navigate = useNavigate();
  const cartTotal = calculateTotal();

  if (!user) {
    return (
      <PageLayout className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You need to be logged in to view your cart.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth')}>
              Log In / Sign Up
            </Button>
          </CardFooter>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout userRole="patient" className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/store')} 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="text-gray-500">{cartItems.length} item(s)</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 py-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 h-64 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-6 bg-blue-50 h-24 w-24 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Looks like you haven't added any medicines to your cart yet. Start shopping to find great deals!
            </p>
            <Button onClick={() => navigate('/store')} className="bg-blue-600 hover:bg-blue-700">
              Browse Medicines
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Cart Items</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex gap-4">
                        {/* Medicine Image */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {item.medicine?.image_url ? (
                            <img 
                              src={item.medicine.image_url} 
                              alt={item.medicine?.name}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Medicine Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.medicine?.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.medicine?.category}
                          </p>
                          
                          {/* Price and Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-gray-100"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-gray-100"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ₹{((item.medicine?.price || 0) * item.quantity).toFixed(2)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-xs text-gray-500">
                                  ₹{(item.medicine?.price || 0).toFixed(2)} each
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm sticky top-4">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Order Summary</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">₹50.00</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-gray-900">
                          ₹{(cartTotal + 50).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
                    onClick={() => navigate('/checkout')}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Free delivery on orders above ₹500
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;
